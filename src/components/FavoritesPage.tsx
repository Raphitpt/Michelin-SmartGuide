'use client'

import { useEffect, useState } from 'react'
import { Heart, Star } from 'lucide-react'
import Link from 'next/link'
import { FILTRE_FAVORIS, FiltreFavoris, TAG, TagValue } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase/client'

const FILTERS = Object.values(FILTRE_FAVORIS)

const TAG_STYLE: Record<TagValue, string> = {
  [TAG.A_ESSAYER]: 'bg-michelin-red/10 text-michelin-red',
  [TAG.VISITE]:    'bg-green-100 text-green-700',
}

interface FavoriteRestaurant {
  swipeId: string
  restaurantId: string
  name: string
  city: string | null
  main_image: string | null
  stars: number
  tag: TagValue
}

export default function FavoritesPage() {
  const [activeFilter, setActiveFilter] = useState<FiltreFavoris>(FILTRE_FAVORIS.TOUS)
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    async function load() {
      setLoading(true)

      const [{ data: swipes }, { data: reservations }] = await Promise.all([
        supabase
          .from('user_swipes')
          .select('id, restaurant_id, restaurants(id, name, city, main_image, michelin_awards(stars))')
          .eq('user_id', user!.id)
          .eq('liked', true),
        supabase
          .from('reservations')
          .select('restaurant_id')
          .eq('user_id', user!.id)
          .eq('status', 'confirmed'),
      ])

      const visitedIds = new Set((reservations ?? []).map((r) => r.restaurant_id))

      const items: FavoriteRestaurant[] = (swipes ?? []).map((s) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = s.restaurants as any
        const stars: number = r?.michelin_awards?.stars ?? r?.michelin_awards?.[0]?.stars ?? 0
        return {
          swipeId: s.id,
          restaurantId: s.restaurant_id,
          name: r?.name ?? '',
          city: r?.city ?? null,
          main_image: r?.main_image ?? null,
          stars,
          tag: visitedIds.has(s.restaurant_id) ? TAG.VISITE : TAG.A_ESSAYER,
        }
      })

      setFavorites(items)
      setLoading(false)
    }

    load()
  }, [user])

  async function removeFavorite(swipeId: string) {
    setFavorites((prev) => prev.filter((f) => f.swipeId !== swipeId))
    const supabase = createClient()
    await supabase.from('user_swipes').update({ liked: false }).eq('id', swipeId)
  }

  const filtered = favorites.filter((f) => {
    if (activeFilter === FILTRE_FAVORIS.TOUS) return true
    if (activeFilter === FILTRE_FAVORIS.A_ESSAYER) return f.tag === TAG.A_ESSAYER
    if (activeFilter === FILTRE_FAVORIS.VISITES) return f.tag === TAG.VISITE
    return true
  })

  return (
    <div className="flex flex-col pb-24 px-4 pt-6">
      <h1 className="text-michelin-black font-bold text-2xl">Mes favoris</h1>
      <p className="text-michelin-gray text-sm mt-0.5 mb-4">
        {loading ? '…' : `${favorites.length} restaurant${favorites.length !== 1 ? 's' : ''}`}
      </p>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              activeFilter === filter
                ? 'bg-michelin-black text-white border-michelin-black'
                : 'bg-white text-michelin-black border-michelin-black/20'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 animate-pulse">
              <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-michelin-gray text-sm text-center mt-12">Aucun favori pour l'instant.</p>
      )}

      {!loading && (
        <div className="flex flex-col gap-3">
          {filtered.map((restaurant) => (
            <div key={restaurant.swipeId} className="flex items-center gap-3 bg-white rounded-xl p-3">
              <Link href={`/restaurants/${restaurant.restaurantId}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-lg shrink-0 bg-gray-100 overflow-hidden">
                  {restaurant.main_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={restaurant.main_image} alt={restaurant.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: restaurant.stars }, (_, index) => (
                      <Star key={`${restaurant.swipeId}-star-${index}`} size={10} fill="#E4002B" stroke="none" />
                    ))}
                  </div>
                  <p className="text-michelin-black font-semibold text-sm leading-snug truncate">{restaurant.name}</p>
                  <p className="text-michelin-gray text-xs mt-0.5">{restaurant.city}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_STYLE[restaurant.tag]}`}>
                    {restaurant.tag}
                  </span>
                </div>
              </Link>
              <button
                className="shrink-0 p-1"
                onClick={() => removeFavorite(restaurant.swipeId)}
                aria-label="Retirer des favoris"
              >
                <Heart size={18} fill="#E4002B" stroke="none" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
