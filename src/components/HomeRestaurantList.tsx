'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { FILTRE_ACCUEIL, FiltreAccueil } from '@/constants'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAuth } from '@/context/AuthContext'
import { useRestaurantActions } from '@/hooks/useRestaurantActions'
import MichelinStar from '@/components/MichelinStar'

interface RestaurantCard {
  id: string
  name: string
  city: string | null
  main_image: string | null
  price_avg_eur: number | null
  stars: number
}

const FILTER_PARAM: Record<string, string> = {
  [FILTRE_ACCUEIL.ETOILES]:      'ETOILES',
  [FILTRE_ACCUEIL.BIB_GOURMAND]: 'BIB_GOURMAND',
  [FILTRE_ACCUEIL.TERRASSE]:     'TERRASSE',
}

const STARS_BY_SLUG: Record<string, number> = {
  ONE_STAR: 1, TWO_STARS: 2, THREE_STARS: 3,
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

function Card({ restaurant, userId }: Readonly<{ restaurant: RestaurantCard; userId: string | null | undefined }>) {
  const { liked, toggleLike } = useRestaurantActions(userId, restaurant.id)

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
        <button
          onClick={(e) => { e.preventDefault(); toggleLike() }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={liked ? 'text-michelin-red' : 'text-michelin-black'}
            fill={liked ? '#E4002B' : 'none'}
          />
        </button>
      </div>
      <div className="p-3">
        {restaurant.stars > 0 && (
          <div className="mb-1">
            <StarRating count={restaurant.stars} />
          </div>
        )}
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

function Skeletons() {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

interface Props {
  activeFilter: FiltreAccueil
  onFilterFallback: () => void
}

export default function HomeRestaurantList({ activeFilter, onFilterFallback }: Props) {
  const [mounted, setMounted] = useState(false)
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const { coords, status } = useGeolocation()
  const { user } = useAuth()

  useEffect(() => { setMounted(true) }, [])

  const isProximity = activeFilter === FILTRE_ACCUEIL.A_PROXIMITE

  // Fetch nearby restaurants
  useEffect(() => {
    if (!isProximity || !coords) return

    setFetchError(false)
    setLoading(true)
    fetch(`/api/restaurants/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=50000`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json() as Promise<{ restaurants: Array<{ id: string; name: string; city: string | null; main_image: string | null; price_avg_eur: number | null; michelin_awards: { stars: number } | null }> }>
      })
      .then(({ restaurants }) => {
        setRestaurants(restaurants.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          main_image: r.main_image,
          price_avg_eur: r.price_avg_eur,
          stars: r.michelin_awards?.stars ?? 0,
        })))
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [isProximity, coords])

  // Fetch recommended restaurants (archetype-scored)
  const fetchRecommended = useCallback(() => {
    const filterParam = FILTER_PARAM[activeFilter]
    if (!filterParam || !user?.id) return

    setFetchError(false)
    setLoading(true)
    setRestaurants([])
    fetch(`/api/restaurants/recommended?userId=${user.id}&filter=${filterParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json() as Promise<{ restaurants: Array<{ id: string; name: string | null; city: string | null; main_image: string | null; price_avg_eur: number | null; award_slug: string | null }> }>
      })
      .then(({ restaurants }) => {
        setRestaurants(restaurants.map((r) => ({
          id: r.id ?? '',
          name: r.name ?? '',
          city: r.city,
          main_image: r.main_image,
          price_avg_eur: r.price_avg_eur,
          stars: STARS_BY_SLUG[r.award_slug ?? ''] ?? 0,
        })))
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [activeFilter, user?.id])

  useEffect(() => {
    if (!isProximity) fetchRecommended()
  }, [isProximity, fetchRecommended])

  // Géoloc denied/unavailable → fallback
  useEffect(() => {
    if (isProximity && (status === 'denied' || status === 'unavailable')) {
      onFilterFallback()
    }
  }, [isProximity, status, onFilterFallback])

  if (!mounted) return null

  if (isProximity && (status === 'idle' || status === 'loading') && restaurants.length === 0) {
    return <Skeletons />
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

  if (loading && restaurants.length === 0) return <Skeletons />

  if (fetchError) {
    return (
      <div className="px-4 py-4 text-michelin-gray text-xs text-center">
        Impossible de charger les restaurants.
      </div>
    )
  }

  if (!restaurants.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
      {restaurants.map((r) => (
        <Card key={r.id} restaurant={r} userId={user?.id} />
      ))}
    </div>
  )
}
