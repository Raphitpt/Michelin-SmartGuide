'use server'

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { GoogleAuth } from 'google-auth-library'

// =====================
// INIT
// =====================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =====================
// AUTH GOOGLE
// =====================
async function getAuthToken() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token
}

// =====================
// MAIN FUNCTION
// =====================
export async function analyse(formData: FormData) {
  const query = formData.get('texte') as string

  if (!query) {
    throw new Error('Texte manquant')
  }

  // =====================
  // 1. VERTEX SEARCH
  // =====================
  const token = await getAuthToken()

  const url = `https://discoveryengine.googleapis.com/v1alpha/projects/${process.env.VERTEX_PROJECT_ID}/locations/global/collections/default_collection/engines/${process.env.VERTEX_ENGINE_ID}/servingConfigs/default_search:search`

  const vertexRes = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      pageSize: 5,
      queryExpansionSpec: { condition: 'AUTO' },
      languageCode: 'fr',
    }),
  })

  const vertexData = await vertexRes.json()

  const results = vertexData.results || []

  const contexte = results
    .map((item: any, i: number) => {
      const doc = item.document?.derivedStructData || {}
      return `Résultat ${i + 1} - Titre: ${doc.title || 'N/A'}, Snippet: ${
        doc.snippets?.[0]?.snippet || 'N/A'
      }`
    })
    .join('\n')

  // =====================
  // 2. RESTAURANTS
  // =====================
  const { data: restaurantsData } = await supabase
    .from('restaurants')
    .select('name')
    .limit(20)

  const restaurants = restaurantsData ?? []

  // =====================
  // 3. TRAITS
  // =====================
  const { data: recoTraitsData, error } = await supabase
    .from('reco_traits')
    .select('id, code, dimension_id, label')

  if (error) throw new Error(error.message)

  // =====================
  // GROUP BY DIMENSION
  // =====================
  const groupedRecoTraits = (recoTraitsData ?? []).reduce(
    (acc: any, trait) => {
      const dimId = trait.dimension_id

      if (!acc[dimId]) acc[dimId] = []

      acc[dimId].push({
        id: trait.id,
        code: trait.code,
        label: trait.label,
      })

      return acc
    },
    {}
  )

  // =====================
  // 4. PROMPT OPENAI
  // =====================
  const traitsByDimensionText = Object.entries(groupedRecoTraits)
    .map(([dimId, traits]: any) => {
      const labels = traits.map((t: any) => t.label).join(', ')
      return `Dimension ${dimId} : ${labels}`
    })
    .join('\n')

  const prompt = `
Voici des dimensions avec leurs traits :

${traitsByDimensionText}

Contexte utilisateur :
${contexte}

Pour chaque dimension, retourne une liste de tags pertinents (ordre du plus pertinent au moins pertinent).

Réponds en JSON :
{
  "dimension_id": ["trait1", "trait2", "trait3", "..."]
}
`

  // =====================
  // 5. OPENAI CALL
  // =====================
  let selectedTraitsByDimension: any = {}

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    selectedTraitsByDimension = JSON.parse(
      completion.choices[0].message.content || '{}'
    )
  } catch (err) {
    console.error('OpenAI error:', err)
  }

  // =====================
  // 6. FINAL RANKING LOGIC
  // =====================
  const normalize = (str: string) =>
    str.toLowerCase().trim()

  const finalRecoTraits = Object.entries(groupedRecoTraits).reduce(
    (acc: any, [dimId, traits]: any) => {
      const iaListRaw =
        selectedTraitsByDimension[dimId] || []

      const iaLabels = iaListRaw.map(normalize)

      // =====================
      // ranking based on IA order
      // =====================
      const ranked = traits
        .map((t: any) => ({
          ...t,
          score: iaLabels.includes(normalize(t.label))
            ? iaLabels.indexOf(normalize(t.label))
            : 9999,
        }))
        .sort((a: any, b: any) => a.score - b.score)

      // =====================
      // max_tags (default 5)
      // =====================
      const maxTags =
        traits?.[0]?.max_tags ?? 5

      const selected = ranked.slice(0, maxTags)

      // =====================
      // available
      // =====================
      const available = ranked.slice(maxTags)

      acc[dimId] = {
        selected,
        available,
        max_tags: maxTags,
        dimension_id: dimId,
      }

      return acc
    },
    {}
  )

  // =====================
  // DEBUG
  // =====================
  console.log('CONTEXTE:', contexte)
  console.log('OPENAI RAW:', selectedTraitsByDimension)
  console.log('FINAL RESULT:', finalRecoTraits)

  // =====================
  // RETURN
  // =====================
  return {
    contexte,
    restaurants,
    reco_traits: finalRecoTraits,
  }
}