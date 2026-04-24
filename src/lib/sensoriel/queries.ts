// src/lib/sensoriel/queries.ts
import { createClient } from '@/utils/supabase/client'

export type TraitInfo = {
  code: string
  label: string
  dimension_id: string
}

export type RestaurantForSwipe = {
  id: string
  name: string
  city: string | null
  main_image: string | null
  images: string[]
  michelin_award_id: string | null
  michelin_stars: number
  michelin_label: string | null
  trait_codes: string[]
  traits: TraitInfo[]
  cuisine_style_label: string | null
  price_category_id: string | null
  price_categories: { price_avg_min_eur: string; price_avg_max_eur: string }[]
}

export async function fetchRestaurantsForSwipe(): Promise<RestaurantForSwipe[]> {
  const supabase = createClient()

  const { data: rpcRestaurants, error: rpcError } = await supabase
    .rpc('get_swipe_restaurants', { limit_count: 50 })

  if (rpcError || !rpcRestaurants || rpcRestaurants.length === 0) return []

  const restaurantIds = (rpcRestaurants as { id: string }[]).map(r => r.id)

  const [{ data: traits }, { data: restaurants, error }, { data: recoTraits, error: recoTraitsError }] = await Promise.all([
    supabase.from('restaurant_traits').select('restaurant_id, trait_code').in('restaurant_id', restaurantIds),
    supabase
      .from('restaurants')
      .select('id, name, city, main_image, michelin_award_id, michelin_awards(stars, label), price_category_id, price_categories!restaurants_price_category_id_fkey(price_avg_min_eur, price_avg_max_eur), restaurant_images(url, position)')
      .in('id', restaurantIds),
    supabase.from('reco_traits').select('code, label, dimension_id'),
  ])

  if (error || !restaurants) return []

  if (recoTraitsError) {
    console.error('[fetchRestaurantsForSwipe] failed to load trait labels:', recoTraitsError.message)
  }

  const traitsByRestaurant: Record<string, string[]> = {}
  for (const t of traits ?? []) {
    if (!traitsByRestaurant[t.restaurant_id]) traitsByRestaurant[t.restaurant_id] = []
    traitsByRestaurant[t.restaurant_id].push(t.trait_code)
  }

  const traitByCode = new Map((recoTraits ?? []).map(t => [t.code, t]))

  function pickCuisineStyleLabel(traitCodes: string[]): string | null {
    const cuisineCode = traitCodes.find(code => code.startsWith('cuisine.'))
    if (cuisineCode) return traitByCode.get(cuisineCode)?.label ?? null

    const styleCode = traitCodes.find(code => code.startsWith('style.'))
    if (styleCode) return traitByCode.get(styleCode)?.label ?? null

    return null
  }

  return restaurants.map(r => {
    const codes = traitsByRestaurant[r.id] ?? []
    const traits: TraitInfo[] = codes
      .map(code => {
        const t = traitByCode.get(code)
        return t ? { code, label: t.label, dimension_id: t.dimension_id } : null
      })
      .filter((t): t is TraitInfo => t !== null)
    const rawAward = (r as unknown as { michelin_awards: { stars: number; label: string } | { stars: number; label: string }[] | null }).michelin_awards
    const award = Array.isArray(rawAward) ? rawAward[0] ?? null : rawAward
    return {
      id: r.id,
      name: r.name,
      city: r.city,
      main_image: r.main_image,
      images: (() => {
        const extra = (r as unknown as { restaurant_images: { url: string; position: number }[] | null }).restaurant_images
        const sorted = Array.isArray(extra) ? [...extra].sort((a, b) => a.position - b.position).map(i => i.url) : []
        const all = r.main_image ? [r.main_image, ...sorted.filter(u => u !== r.main_image)] : sorted
        return all.slice(0, 3)
      })(),
      michelin_award_id: r.michelin_award_id,
      michelin_stars: award?.stars ?? 0,
      michelin_label: award?.stars === 0 ? (award?.label ?? null) : null,
      trait_codes: codes,
      traits,
      cuisine_style_label: pickCuisineStyleLabel(codes),
      price_category_id: r.price_category_id,
      price_categories: (() => {
        const pc = r.price_categories as unknown
        if (!pc) return []
        if (Array.isArray(pc)) return pc as { price_avg_min_eur: string; price_avg_max_eur: string }[]
        return [pc as { price_avg_min_eur: string; price_avg_max_eur: string }]
      })(),
    }
  })
}

export async function fetchArchetypesAndWeights() {
  const supabase = createClient()

  const [archetypesRes, weightsRes, traitsRes, dimensionsRes] = await Promise.all([
    supabase.from('reco_archetypes').select('id, nom, description'),
    supabase.from('reco_archetype_weights').select('archetype_id, trait_code, weight'),
    supabase.from('reco_traits').select('code, label, dimension_id'),
    supabase.from('reco_dimensions').select('id, nom, question').order('sort_order'),
  ])

  if (archetypesRes.error) console.error('[fetchArchetypesAndWeights] archetypes:', archetypesRes.error.message)
  if (weightsRes.error) console.error('[fetchArchetypesAndWeights] weights:', weightsRes.error.message)

  return {
    archetypes: archetypesRes.data ?? [],
    weights: weightsRes.data ?? [],
    traitLabels: Object.fromEntries(
      (traitsRes.data ?? []).map(t => [t.code, t.label])
    ),
    traitDimensions: Object.fromEntries(
      (traitsRes.data ?? []).map(t => [t.code, t.dimension_id])
    ),
    dimensions: (dimensionsRes.data ?? []) as { id: string; nom: string; question: string }[],
  }
}

export type MatchRestaurant = {
  id: string
  name: string
  city: string | null
  main_image: string | null
  michelin_stars: number
  michelin_label: string | null
  cuisine_style_label: string | null
  distance_km: number | null
}

export async function fetchMatchRestaurant(
  archetypeId: string,
  coords?: { lat: number; lng: number } | null,
  excludeIds?: string[],
): Promise<MatchRestaurant | null> {
  const supabase = createClient()

  const { data: weights } = await supabase
    .from('reco_archetype_weights')
    .select('trait_code, weight')
    .eq('archetype_id', archetypeId)
    .order('weight', { ascending: false })
    .limit(20)

  if (!weights || weights.length === 0) return null

  const topCodes = weights.slice(0, 10).map(w => w.trait_code)
  const { data: traitRows, error: traitError } = await supabase
    .from('restaurant_traits')
    .select('restaurant_id')
    .in('trait_code', topCodes)

  if (!traitRows || traitRows.length === 0) return null

  const scoreMap: Record<string, number> = {}
  for (const row of traitRows) {
    scoreMap[row.restaurant_id] = (scoreMap[row.restaurant_id] ?? 0) + 1
  }

  let nearbyIds: Set<string> | null = null
  const distanceMap: Record<string, number> = {}

  if (coords) {
    const { data: nearbyRows } = await supabase.rpc('restaurants_nearby', {
      user_lat: coords.lat,
      user_lng: coords.lng,
      radius_meters: 50000,
    })
    if (nearbyRows && Array.isArray(nearbyRows)) {
      nearbyIds = new Set((nearbyRows as Array<{ id: string; distance_meters?: number }>).map(r => r.id))
      for (const r of nearbyRows as Array<{ id: string; distance_meters?: number }>) {
        if (r.distance_meters != null) {
          distanceMap[r.id] = Math.round(r.distance_meters / 100) / 10
        }
      }
    }
  }

  const nearbyFiltered = nearbyIds
    ? Object.keys(scoreMap).filter(id => nearbyIds!.has(id))
    : Object.keys(scoreMap)

  const candidateIds = nearbyFiltered.length > 0 ? nearbyFiltered : Object.keys(scoreMap)

  if (candidateIds.length === 0) return null

  candidateIds.sort((a, b) => (scoreMap[b] ?? 0) - (scoreMap[a] ?? 0))

  const excluded = new Set(excludeIds ?? [])
  const filtered = candidateIds.filter(id => !excluded.has(id))
  const pool = (filtered.length > 0 ? filtered : candidateIds).slice(0, 3)
  const bestId = pool[Math.floor(Math.random() * pool.length)]

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, city, main_image, michelin_award_id, michelin_awards(stars, label)')
    .eq('id', bestId)
    .eq('is_published', true)
    .maybeSingle()

  if (!restaurant) return null

  const { data: traitLabels } = await supabase
    .from('restaurant_traits')
    .select('trait_code, reco_traits(label, dimension_id)')
    .eq('restaurant_id', bestId)

  const cuisineLabel = traitLabels
    ?.map(t => {
      const raw = t.reco_traits as unknown
      const rt = Array.isArray(raw) ? (raw[0] as { label: string; dimension_id: string } | undefined) ?? null : raw as { label: string; dimension_id: string } | null
      return rt ? { code: t.trait_code, label: rt.label, dimension_id: rt.dimension_id } : null
    })
    .filter(Boolean)
    .find(t => t!.code.startsWith('cuisine.') || t!.code.startsWith('style.'))?.label ?? null

  const rawAward = (restaurant as unknown as { michelin_awards: { stars: number; label: string } | { stars: number; label: string }[] | null }).michelin_awards
  const award = Array.isArray(rawAward) ? rawAward[0] ?? null : rawAward

  return {
    id: restaurant.id,
    name: restaurant.name,
    city: restaurant.city,
    main_image: restaurant.main_image,
    michelin_stars: award?.stars ?? 0,
    michelin_label: award?.stars === 0 ? (award?.label ?? null) : null,
    cuisine_style_label: cuisineLabel,
    distance_km: distanceMap[bestId] ?? null,
  }
}

export async function checkHasTasteProfile(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_taste_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
