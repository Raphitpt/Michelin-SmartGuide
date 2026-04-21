'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Heart, ArrowRight } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import { FILTRE_ACCUEIL, FiltreAccueil, ROUTES, UTILISATEUR } from '@/constants'

const FILTERS = Object.values(FILTRE_ACCUEIL)

const RESTAURANTS = [
  {
    id: 1,
    name: 'Le Clarence',
    location: 'Paris 8e',
    cuisine: 'Française',
    price: '€€€€',
    stars: 3,
    match: 96,
    bg: 'bg-gradient-to-br from-[#6B3A1F] to-[#C4722A]',
    favorited: false,
  },
  {
    id: 2,
    name: 'Kei',
    location: 'Paris 1er',
    cuisine: 'Fusion',
    price: '€€€€',
    stars: 2,
    match: 92,
    bg: 'bg-[#1B3A2E]',
    favorited: true,
  },
]

function CircularProgress({ value }: Readonly<{ value: number }>) {
  const r = 26
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="-rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          stroke="white" strokeWidth="3" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-white text-xs font-bold">{value}%</span>
    </div>
  )
}

function StarRating({ count }: Readonly<{ count: number }>) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star key={`star-${i}`} size={10} fill="#E4002B" stroke="none" />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FiltreAccueil>(FILTRE_ACCUEIL.A_PROXIMITE)

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />

      {/* Greeting */}
      <section className="px-4 pt-5 pb-4">
        <p className="text-michelin-gray text-sm">Bonsoir, Raphaël</p>
        <h1 className="text-michelin-black font-bold text-2xl leading-tight mt-0.5">
          Où dîne-t-on ce soir&nbsp;?
        </h1>
      </section>

      {/* Profile card */}
      <section className="px-4 mb-5">
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#1C0907' }}>
          <div>
            <p className="text-white/50 text-[10px] font-semibold tracking-widest uppercase mb-1">
              Votre profil
            </p>
            <p className="text-white font-bold text-base leading-tight">
              {UTILISATEUR.TYPE_PROFIL}
            </p>
            <Link href={ROUTES.PROFIL} className="text-white/60 text-xs mt-1 flex items-center gap-1 hover:text-white transition-colors">
              Affiner mon profil <ArrowRight size={11} />
            </Link>
          </div>
          <CircularProgress value={UTILISATEUR.MATCH} />
        </div>
      </section>

      {/* Filters */}
      <section className="mb-5">
        <div className="flex gap-2 overflow-x-auto px-4 scrollbar-none pb-1">
          {FILTERS.map((filter) => {
            const active = filter === activeFilter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-michelin-black text-white border-michelin-black'
                    : 'bg-white text-michelin-black border-michelin-black/20 hover:border-michelin-black/50'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </section>

      {/* Section header */}
      <section className="px-4 mb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-michelin-black font-bold text-base">Pour vous ce soir</h2>
          <Link href={ROUTES.RESTAURANTS} className="text-michelin-red text-sm font-medium hover:opacity-80">
            Tout voir
          </Link>
        </div>
        <p className="text-michelin-gray text-xs mt-0.5">12 restaurants qui vous correspondent</p>
      </section>

      {/* Restaurant cards horizontal scroll */}
      <section className="mb-5">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {RESTAURANTS.map((r) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}`}
              className="shrink-0 w-44 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className={`relative w-full h-40 ${r.bg}`}>
                {/* Match badge */}
                <span className="absolute top-2 right-2 bg-michelin-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {r.match}%
                </span>
                {/* Favorite */}
                <button
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <Heart
                    size={14}
                    strokeWidth={1.5}
                    className={r.favorited ? 'fill-michelin-red stroke-michelin-red' : 'stroke-michelin-black'}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                {r.stars > 0 && (
                  <div className="mb-1">
                    <StarRating count={r.stars} />
                  </div>
                )}
                <p className="font-semibold text-michelin-black text-sm leading-snug">{r.name}</p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  {r.location} · {r.cuisine}
                </p>
                <p className="text-michelin-black text-xs font-medium mt-0.5">{r.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Michelin selection banner */}
      <section className="mx-4">
        <Link
          href={ROUTES.RESTAURANTS}
          className="flex items-center justify-between rounded-xl px-4 py-4 bg-michelin-black text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Star size={14} fill="white" stroke="none" />
            <span className="text-sm font-medium">Sélection Michelin</span>
            <span className="text-white/50 text-sm">·</span>
            <span className="text-sm text-white/70">8 étoilés autour de vous</span>
          </div>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      </section>

    </div>
  )
}
