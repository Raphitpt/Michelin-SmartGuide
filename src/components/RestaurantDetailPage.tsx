import { createAdminClient } from '@/utils/supabase/server'
import RestaurantDetailContent from '@/components/RestaurantDetailContent'

export default async function RestaurantDetailPage({ id }: Readonly<{ id: string }>) {
  const supabase = createAdminClient()
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*, michelin_awards(*), price_categories(*), restaurant_images(*)')
    .eq('id', id)
    .single()

  if (!restaurant) return null

  return <RestaurantDetailContent restaurant={restaurant} />
}
