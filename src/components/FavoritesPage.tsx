'use client'

import { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { FILTRE_FAVORIS, FiltreFavoris, TAG, TagValue } from '@/constants'

const FILTERS = Object.values(FILTRE_FAVORIS)

const FAVORITES: { id: number; name: string; location: string; cuisine: string; stars: number; bg: string; tag: TagValue }[] = [
  { id: 1, name: 'Le Clarence', location: 'Paris 8e',  cuisine: 'Française', stars: 2, bg: 'bg-gradient-to-br from-[#6B3A1F] to-[#C4722A]', tag: TAG.A_ESSAYER },
  { id: 2, name: 'Kei',         location: 'Paris 1er', cuisine: 'Fusion',    stars: 3, bg: 'bg-[#1B3A2E]',                                   tag: TAG.VISITE    },
  { id: 3, name: 'Septime',     location: 'Paris 11e', cuisine: 'Française', stars: 1, bg: 'bg-gradient-to-br from-[#3A1B3A] to-[#6B2D6B]', tag: TAG.A_ESSAYER },
  { id: 4, name: 'Arpège',      location: 'Paris 7e',  cuisine: 'Française', stars: 3, bg: 'bg-gradient-to-br from-[#5C4A00] to-[#8B7020]', tag: TAG.VISITE    },
]

const TAG_STYLE: Record<TagValue, string> = {
  [TAG.A_ESSAYER]: 'bg-michelin-red/10 text-michelin-red',
  [TAG.VISITE]:    'bg-green-100 text-green-700',
}

export default function FavoritesPage() {
  const [activeFilter, setActiveFilter] = useState<FiltreFavoris>(FILTRE_FAVORIS.TOUS)

  const filtered = FAVORITES.filter((restaurant) =>
    activeFilter === FILTRE_FAVORIS.TOUS ||
    restaurant.tag === activeFilter ||
    (activeFilter === FILTRE_FAVORIS.VISITES && restaurant.tag === TAG.VISITE)
  )

  return (
    <div className="flex flex-col pb-24 px-4 pt-6">

      <h1 className="text-michelin-black font-bold text-2xl">Mes favoris</h1>
      <p className="text-michelin-gray text-sm mt-0.5 mb-4">128 restaurants</p>

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

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map((restaurant) => (
          <div key={restaurant.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
            <div className={`w-20 h-20 rounded-lg shrink-0 ${restaurant.bg}`} />
            <div className="flex-1 min-w-0">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: restaurant.stars }, (_, index) => (
                  <Star key={`${restaurant.id}-star-${index}`} size={10} fill="#E4002B" stroke="none" />
                ))}
              </div>
              <p className="text-michelin-black font-semibold text-sm leading-snug truncate">{restaurant.name}</p>
              <p className="text-michelin-gray text-xs mt-0.5">{restaurant.location} · {restaurant.cuisine}</p>
              <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_STYLE[restaurant.tag]}`}>
                {restaurant.tag}
              </span>
            </div>
            <button className="shrink-0 p-1">
              <Heart size={18} fill="#E4002B" stroke="none" />
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
