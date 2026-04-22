'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { FILTRE_ACCUEIL, FiltreAccueil } from '@/constants'
import { useGeolocation } from '@/hooks/useGeolocation'
import MichelinStar from '@/components/MichelinStar'
import { Database } from '@/types/supabase'

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

function SkeletonCard() {
  return (
    <div className="shrink-0 w-44 rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="w-full h-40 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

interface HomeRestaurantListProps {
  activeFilter: FiltreAccueil
  onFilterFallback: () => void
}

export default function HomeRestaurantList({ activeFilter, onFilterFallback }: HomeRestaurantListProps) {
  const [mounted, setMounted] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [fetchError, setFetchError] = useState(false)
  const { coords, status } = useGeolocation()

  useEffect(() => { setMounted(true) }, [])

  const isProximity = activeFilter === FILTRE_ACCUEIL.A_PROXIMITE

  useEffect(() => {
    if (!isProximity || !coords) return

    setFetchError(false)
    fetch(`/api/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=50000`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json() as Promise<{ restaurants: Restaurant[] }>
      })
      .then(({ restaurants }) => setRestaurants(restaurants))
      .catch(() => setFetchError(true))
  }, [isProximity, coords])

  // Géoloc denied/unavailable → fallback
  useEffect(() => {
    if (isProximity && (status === 'denied' || status === 'unavailable')) {
      onFilterFallback()
    }
  }, [isProximity, status, onFilterFallback])

  if (!mounted) return null

  if (isProximity && (status === 'idle' || status === 'loading') && restaurants.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
        {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (isProximity && (status === 'denied' || status === 'unavailable')) {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
        <MapPin size={28} className="text-michelin-gray" />
        <p className="text-michelin-black text-sm font-medium">Activez la géolocalisation</p>
        <p className="text-michelin-gray text-xs max-w-xs">
          Pour voir les restaurants à proximité, autorisez l'accès à votre position dans les paramètres du navigateur.
        </p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="px-4 py-4 text-michelin-gray text-xs text-center">
        Impossible de charger les restaurants à proximité.
      </div>
    )
  }

  if (!restaurants.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {restaurants.map((r) => (
        <HomeRestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  )
}
