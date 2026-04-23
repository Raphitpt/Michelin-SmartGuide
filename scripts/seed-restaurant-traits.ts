/**
 * seed-restaurant-traits.ts
 *
 * Pour chaque restaurant sans traits en base, interroge GPT-4.1-nano (OpenAI)
 * pour inférer les bons trait_codes depuis les données disponibles et insère
 * le résultat dans restaurant_traits.
 *
 * Prérequis :
 *   1. OPENAI_API_KEY dans .env
 *   2. bun add @supabase/supabase-js openai
 *
 * Usage :
 *   bun run scripts/seed-restaurant-traits.ts
 *
 * Options :
 *   --dry-run          : affiche les INSERT sans les exécuter
 *   --limit=100        : traite au maximum N restaurants (défaut : tous)
 *   --batch=20         : restaurants par appel OpenAI (défaut : 20)
 *   --offset=0         : reprend depuis un offset donné
 *   --model=gpt-4.1-nano : modèle OpenAI à utiliser
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENAI_KEY   = process.env.OPENAI_API_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing SUPABASE env vars — check .env')
if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY — check .env')

const args       = process.argv.slice(2)
const DRY_RUN    = args.includes('--dry-run')
const LIMIT      = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]    ?? '0')  || 0
const BATCH      = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1]    ?? '50') || 50
const OFFSET     = parseInt(args.find(a => a.startsWith('--offset='))?.split('=')[1]   ?? '0')  || 0
const WORKERS    = parseInt(args.find(a => a.startsWith('--workers='))?.split('=')[1]  ?? '5')  || 5
const MODEL      = args.find(a => a.startsWith('--model='))?.split('=')[1] ?? 'gpt-5.4-mini'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const openai   = new OpenAI({ apiKey: OPENAI_KEY })

// ─── Taxonomie (chargée depuis reco_traits en DB) ─────────────────────────────

type RecoTrait = { code: string; label: string; dimension_id: string }

const DIMENSION_LABELS: Record<string, string> = {
  D1: 'Origine culinaire',
  D2: 'Produits phares',
  D3: 'Sensations en bouche',
  D4: 'Contexte & ambiance',
  D5: 'Valeurs & engagements',
  D6: 'Budget (en assigner EXACTEMENT 1)',
  D7: 'Catégorie (en assigner AU MOINS 1)',
}

async function fetchTaxonomy(): Promise<{ taxonomy: string; validCodes: Set<string> }> {
  const { data, error } = await supabase
    .from('reco_traits')
    .select('code, label, dimension_id')
    .order('dimension_id')
    .order('code')

  if (error) throw new Error(`Failed to fetch reco_traits: ${error.message}`)
  const traits = (data ?? []) as RecoTrait[]

  const byDimension: Record<string, RecoTrait[]> = {}
  for (const t of traits) {
    ;(byDimension[t.dimension_id] ??= []).push(t)
  }

  const lines: string[] = []
  for (const [dim, items] of Object.entries(byDimension).sort()) {
    lines.push(`\n${dim}${DIMENSION_LABELS[dim] ? ' — ' + DIMENSION_LABELS[dim] : ''}`)
    for (const t of items) {
      lines.push(`${t.code.padEnd(24)} ${t.label}`)
    }
  }

  return {
    taxonomy: lines.join('\n'),
    validCodes: new Set(traits.map(t => t.code)),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Restaurant = {
  id: string
  name: string
  city: string | null
  country_id: string | null
  philosophy: string | null
  history: string | null
  price_avg_eur: number | null
  green_star: boolean
  good_menu: boolean
  take_away: boolean
  michelin_awards: { stars: number; label: string; slug: string } | null
}

type TraitAssignment = {
  restaurant_id: string
  trait_codes: string[]
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchRestaurantsWithoutTraits(limit: number, offset: number): Promise<Restaurant[]> {
  // Fetch all done IDs with pagination (can exceed 1000)
  const doneIds = new Set<string>()
  let page = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('restaurant_traits')
      .select('restaurant_id')
      .range(page * PAGE, (page + 1) * PAGE - 1)
    if (error) throw new Error(`Fetch done IDs error: ${error.message}`)
    for (const r of data ?? []) doneIds.add((r as { restaurant_id: string }).restaurant_id)
    if (!data || data.length < PAGE) break
    page++
  }

  // Fetch all published restaurants with pagination
  const all: Restaurant[] = []
  let rPage = 0
  while (true) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, city, country_id, philosophy, history, price_avg_eur, green_star, good_menu, take_away, michelin_awards(stars, label, slug)')
      .eq('is_published', true)
      .range(rPage * PAGE, (rPage + 1) * PAGE - 1)
      .order('name')
    if (error) throw new Error(`Fetch error: ${error.message}`)
    all.push(...((data ?? []) as unknown as Restaurant[]))
    if (!data || data.length < PAGE) break
    rPage++
  }

  const todo = all.filter(r => !doneIds.has(r.id))

  if (offset > 0) todo.splice(0, offset)
  if (limit > 0)  todo.splice(limit)

  return todo
}

// ─── OpenAI API ───────────────────────────────────────────────────────────────

async function gptChat(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    max_completion_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert gastronomique Michelin. Tu réponds UNIQUEMENT en JSON valide, sans markdown ni explication. La réponse doit être un objet JSON avec une clé "results" contenant un tableau.',
      },
      { role: 'user', content: prompt },
    ],
  })

  return response.choices[0]?.message?.content ?? ''
}

// ─── Inférence ────────────────────────────────────────────────────────────────

async function inferTraitsForBatch(batch: Restaurant[], taxonomy: string, validCodes: Set<string>): Promise<TraitAssignment[]> {
  const descriptions = batch.map((r, i) => {
    const award = r.michelin_awards
    const awardStr = award
      ? award.stars > 0 ? `${award.stars} étoile(s) Michelin` : award.label
      : 'Sans distinction Michelin'

    const price = r.price_avg_eur ? `~${r.price_avg_eur}€/pers` : 'Prix inconnu'
    const desc  = (r.philosophy ?? r.history ?? '').slice(0, 250)
    const flags = [
      r.green_star ? 'Étoile verte Michelin (cuisine durable)' : '',
      r.good_menu  ? 'Menu à bon prix' : '',
      r.take_away  ? 'À emporter' : '',
    ].filter(Boolean).join(', ')

    return `[${i}] id=${r.id} | ${r.name} | ${r.city ?? '?'}, ${r.country_id ?? '?'} | ${awardStr} | ${price}${desc ? ` | ${desc}` : ''}${flags ? ` | ${flags}` : ''}`
  }).join('\n')

  const prompt = `Assigne des trait_codes à ces ${batch.length} restaurants Michelin.

RÈGLES STRICTES :
- Entre 4 et 8 traits par restaurant
- EXACTEMENT 1 trait price.* par restaurant
- AU MOINS 1 trait style.* ou cat.* par restaurant
- Utilise UNIQUEMENT les codes listés dans la taxonomie ci-dessous
- Si incertain sur un trait, ne l'assigne pas

TAXONOMIE :
${taxonomy}

RESTAURANTS :
${descriptions}

Réponds avec un objet JSON : {"results":[{"index":0,"id":"...","traits":["code1","code2"]},...]}`

  const raw = await gptChat(prompt)

  let parsed: Array<{ index: number; id: string; traits: string[] }>
  try {
    const obj = JSON.parse(raw)
    parsed = obj.results ?? obj
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error(`Cannot parse GPT response:\n${raw.slice(0, 400)}`)
    parsed = JSON.parse(match[0])
  }

  const validIds = new Set(batch.map(r => r.id))

  return parsed
    .filter(item => typeof item.id === 'string' && validIds.has(item.id))
    .map(item => ({
      restaurant_id: item.id,
      trait_codes: (item.traits ?? []).filter((t: string) => typeof t === 'string' && validCodes.has(t)),
    }))
}

// ─── Insert ───────────────────────────────────────────────────────────────────

async function insertTraits(assignments: TraitAssignment[]): Promise<number> {
  const rows = assignments.flatMap(a =>
    a.trait_codes.map(code => ({ restaurant_id: a.restaurant_id, trait_code: code }))
  )
  if (rows.length === 0) return 0

  const { error } = await supabase
    .from('restaurant_traits')
    .upsert(rows, { onConflict: 'restaurant_id,trait_code', ignoreDuplicates: true })

  if (error) throw new Error(`Insert error: ${error.message}`)
  return rows.length
}

// ─── Worker pool ─────────────────────────────────────────────────────────────

async function processBatch(
  batch: Restaurant[],
  batchNum: number,
  totalBatches: number,
  taxonomy: string,
  validCodes: Set<string>,
): Promise<{ inserted: number; error: boolean }> {
  process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} restos)… `)
  try {
    const assignments = await inferTraitsForBatch(batch, taxonomy, validCodes)
    if (DRY_RUN) {
      console.log('')
      for (const a of assignments) {
        const name = batch.find(r => r.id === a.restaurant_id)?.name ?? a.restaurant_id
        console.log(`\n-- ${name}`)
        for (const code of a.trait_codes) {
          console.log(`INSERT INTO restaurant_traits (restaurant_id, trait_code) VALUES ('${a.restaurant_id}', '${code}') ON CONFLICT DO NOTHING;`)
        }
      }
      return { inserted: 0, error: false }
    }
    const count = await insertTraits(assignments)
    console.log(`✓ ${count} traits`)
    return { inserted: count, error: false }
  } catch (err) {
    // Retry once on rate limit
    if (err instanceof Error && err.message.includes('429')) {
      await new Promise(r => setTimeout(r, 10000))
      return processBatch(batch, batchNum, totalBatches, taxonomy, validCodes)
    }
    console.error(`✗ ${err instanceof Error ? err.message : err}`)
    return { inserted: 0, error: true }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🍽  Michelin Trait Seeder — OpenAI')
  console.log(`   Modèle  : ${MODEL}`)
  console.log(`   Mode    : ${DRY_RUN ? "DRY RUN (pas d'insert)" : 'LIVE'}`)
  console.log(`   Batch   : ${BATCH} restaurants / appel`)
  console.log(`   Workers : ${WORKERS} en parallèle`)
  if (LIMIT)  console.log(`   Limit   : ${LIMIT}`)
  if (OFFSET) console.log(`   Offset  : ${OFFSET}`)
  console.log()

  const { taxonomy, validCodes } = await fetchTaxonomy()
  console.log(`Taxonomie chargée : ${validCodes.size} traits\n`)

  const restaurants = await fetchRestaurantsWithoutTraits(LIMIT, OFFSET)
  console.log(`Restaurants sans traits : ${restaurants.length}\n`)

  if (restaurants.length === 0) {
    console.log('✅ Rien à faire.')
    return
  }

  // Découpe en batches
  const batches: Restaurant[][] = []
  for (let i = 0; i < restaurants.length; i += BATCH) {
    batches.push(restaurants.slice(i, i + BATCH))
  }
  const totalBatches = batches.length

  let totalInserted = 0
  let errors        = 0

  // Traitement par fenêtre de WORKERS workers en parallèle
  for (let i = 0; i < batches.length; i += WORKERS) {
    const window = batches.slice(i, i + WORKERS)
    const results = await Promise.all(
      window.map((batch, j) => processBatch(batch, i + j + 1, totalBatches, taxonomy, validCodes))
    )
    for (const r of results) {
      totalInserted += r.inserted
      if (r.error) errors++
    }
  }

  console.log()
  if (DRY_RUN) {
    console.log(`✅ Dry run — ${restaurants.length} restaurants traités`)
  } else {
    console.log(`✅ Terminé — ${totalInserted} traits insérés pour ${restaurants.length} restaurants`)
    if (errors > 0) {
      console.log(`⚠  ${errors} batch(es) en erreur`)
      console.log(`   Relance : bun run scripts/seed-restaurant-traits.ts --offset=${OFFSET + (restaurants.length - errors * BATCH)}`)
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
