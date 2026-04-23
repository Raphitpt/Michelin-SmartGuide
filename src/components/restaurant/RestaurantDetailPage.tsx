import { createAdminClient } from '@/utils/supabase/server'
import RestaurantDetailContent from '@/components/restaurant/RestaurantDetailContent'

export default async function RestaurantDetailPage({ id }: Readonly<{ id: string }>) {
  const supabase = createAdminClient()

  const [{ data: restaurant }, { data: traitRows }] = await Promise.all([
    supabase
      .from('restaurants')
      .select('*, michelin_awards(*), price_categories(*), restaurant_images(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('restaurant_traits')
      .select('trait_code, reco_traits(label, dimension_id)')
      .eq('restaurant_id', id),
  ])

  if (!restaurant) return null

  const traits = (traitRows ?? []).flatMap(row => {
    const rt = row.reco_traits as { label: string; dimension_id: string } | { label: string; dimension_id: string }[] | null
    const info = Array.isArray(rt) ? rt[0] : rt
    if (!info) return []
    return [{ code: row.trait_code, label: info.label, dimension_id: info.dimension_id }]
  })

  return <RestaurantDetailContent restaurant={restaurant} traits={traits} />
}
