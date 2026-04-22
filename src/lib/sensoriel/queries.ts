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
  michelin_award_id: string | null
  trait_codes: string[]
  traits: TraitInfo[]
  cuisine_style_label: string | null
}

export async function fetchRestaurantsForSwipe(): Promise<RestaurantForSwipe[]> {
  const supabase = createClient()

  const { data: traits, error: traitsError } = await supabase
    .from('restaurant_traits')
    .select('restaurant_id, trait_code')

  if (traitsError || !traits || traits.length === 0) return []

  const traitsByRestaurant: Record<string, string[]> = {}
  for (const t of traits) {
    if (!traitsByRestaurant[t.restaurant_id]) {
      traitsByRestaurant[t.restaurant_id] = []
    }
    traitsByRestaurant[t.restaurant_id].push(t.trait_code)
  }

  const restaurantIds = Object.keys(traitsByRestaurant)
  const uniqueTraitCodes = Array.from(new Set(traits.map(t => t.trait_code)))

  const [{ data: restaurants, error }, { data: recoTraits, error: recoTraitsError }] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, name, city, main_image, michelin_award_id')
      .in('id', restaurantIds)
      .eq('is_published', true)
      .limit(15),
    supabase.from('reco_traits').select('code, label, dimension_id').in('code', uniqueTraitCodes),
  ])

  if (error || !restaurants) return []

  if (recoTraitsError) {
    console.error('[fetchRestaurantsForSwipe] failed to load trait labels:', recoTraitsError.message)
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
    return {
      ...r,
      trait_codes: codes,
      traits,
      cuisine_style_label: pickCuisineStyleLabel(codes),
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

export async function checkHasTasteProfile(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_taste_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
