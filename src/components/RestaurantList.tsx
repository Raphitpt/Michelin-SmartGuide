import { createAdminClient } from '@/utils/supabase/server'
import RestaurantCard from '@/components/RestaurantCard'

export default async function RestaurantList() {
  const supabase = createAdminClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*, michelin_awards(*)')
      .eq('is_published', true)
    .limit(100)

if (!restaurants?.length) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8 md:px-8 lg:px-12">
      <h1 className="text-2xl font-bold text-michelin-black mb-6">Restaurants</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            name={r.name}
            location={r.city ?? ''}
            cuisine=""
            price=""
            href={`/restaurants/${r.slug}`}
          />
        ))}
      </div>
    </main>
  )
}
