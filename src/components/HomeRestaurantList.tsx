import { createAdminClient } from '@/utils/supabase/server'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/supabase'
import MichelinStar from '@/components/MichelinStar'

type MichelinAward = Database['public']['Tables']['michelin_awards']['Row']
type Restaurant = Database['public']['Tables']['restaurants']['Row'] & {
  michelin_awards: MichelinAward | null
}

function StarRating({ count }: Readonly<{ count: number }>) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <MichelinStar key={`star-${i}`} />
      ))}
    </div>
  )
}

function HomeRestaurantCard({ restaurant }: Readonly<{ restaurant: Restaurant }>) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="shrink-0 w-44 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-40 bg-gray-100">
        {restaurant.main_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.main_image} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
          <Heart size={14} strokeWidth={1.5} className="stroke-michelin-black" />
        </div>
      </div>

      <div className="p-3">
        <div className="mb-1">
          <StarRating count={restaurant.michelin_awards?.stars ?? 0} />
        </div>
        <p className="font-semibold text-michelin-black text-sm leading-snug">{restaurant.name}</p>
        <p className="text-michelin-gray text-xs mt-0.5">{restaurant.city}</p>
        {restaurant.price_avg_eur && (
          <p className="text-michelin-black text-xs font-medium mt-0.5">{restaurant.price_avg_eur}€ moy.</p>
        )}
      </div>
    </Link>
  )
}

export default async function HomeRestaurantList() {
  const supabase = createAdminClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*, michelin_awards(*)')
      .eq('is_published', true)
      .not('main_image', 'is', null)
    .limit(20)

  if (!restaurants?.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {restaurants.map((r) => (
        <HomeRestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  )
}
