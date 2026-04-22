// src/lib/sensoriel/queries.ts
import { createClient } from '@/utils/supabase/client'

export type RestaurantForSwipe = {
  id: string
  name: string
  city: string | null
  main_image: string | null
  michelin_award_id: string | null
  trait_codes: string[]
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

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, city, main_image, michelin_award_id')
    .in('id', restaurantIds)
    .eq('is_published', true)
    .limit(15)

  if (error || !restaurants) return []

  return restaurants.map(r => ({
    ...r,
    trait_codes: traitsByRestaurant[r.id] ?? [],
  }))
}

export async function fetchArchetypesAndWeights() {
  const supabase = createClient()

  const [archetypesRes, weightsRes, traitsRes] = await Promise.all([
    supabase.from('reco_archetypes').select('id, nom, description').order('sort_order'),
    supabase.from('reco_archetype_weights').select('archetype_id, trait_code, weight'),
    supabase.from('reco_traits').select('code, label'),
  ])

  return {
    archetypes: archetypesRes.data ?? [],
    weights: weightsRes.data ?? [],
    traitLabels: Object.fromEntries(
      (traitsRes.data ?? []).map(t => [t.code, t.label])
    ),
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
