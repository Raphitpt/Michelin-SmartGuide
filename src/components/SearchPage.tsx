'use client'

import { Search, Sparkles, ArrowDown, Map } from 'lucide-react'
import Link from 'next/link'
import { RECHERCHES_POPULAIRES, ROUTES } from '@/constants'

const CUISINES = [
  { label: 'Française',  emoji: '🥖', bg: 'bg-[#9B8B5A]' },
  { label: 'Japonaise',  emoji: '🍱', bg: 'bg-[#8B3A3A]' },
  { label: 'Italienne',  emoji: '🍅', bg: 'bg-[#3A7A4A]' },
  { label: 'Fusion',     emoji: '🌍', bg: 'bg-[#3A5A8A]' },
]

export default function SearchPage() {
  return (
    <div className="flex flex-col pb-28 px-4 pt-6">

      {/* Title */}
      <h1 className="text-michelin-black font-bold text-2xl mb-4">Rechercher</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-michelin-gray"
          strokeWidth={1.5}
        />
        <input
          type="text"
          placeholder="Restaurant, cuisine, quartier..."
          className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm text-michelin-black placeholder:text-michelin-gray/60 outline-none"
        />
      </div>

      {/* Popular searches */}
      <section className="mb-7">
        <p className="text-michelin-black text-sm font-medium mb-3">Recherches populaires</p>
        <div className="flex flex-wrap gap-2">
          {RECHERCHES_POPULAIRES.map((tag) => (
            <button
              key={tag}
              className="px-4 py-1.5 rounded-full border border-michelin-black/20 text-sm text-michelin-black bg-white hover:border-michelin-black/50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Explorer par cuisine */}
      <section className="mb-6">
        <p className="text-michelin-black font-bold text-lg mb-3">Explorer par cuisine</p>
        <div className="grid grid-cols-2 gap-3">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine.label}
              className={`${cuisine.bg} rounded-xl h-24 flex flex-col justify-end p-3 text-left hover:opacity-90 transition-opacity`}
            >
              <span className="text-xl mb-1">{cuisine.emoji}</span>
              <span className="text-white font-semibold text-sm">{cuisine.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Selon vos goûts */}
      <button className="flex items-center gap-2 text-michelin-black text-sm font-medium mb-6 self-start">
        <Sparkles size={16} strokeWidth={1.5} />
        Selon vos goûts
        <ArrowDown size={14} strokeWidth={2} />
      </button>

      {/* Voir sur la carte — fixed */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3">
        <Link
          href={ROUTES.CARTE}
          className="flex items-center justify-center gap-2 w-full bg-michelin-black text-white text-sm font-medium py-4 rounded-full hover:opacity-90 transition-opacity"
        >
          <Map size={16} strokeWidth={1.5} />
          Voir sur la carte
        </Link>
      </div>

    </div>
  )
}
