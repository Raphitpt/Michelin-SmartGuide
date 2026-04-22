'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import HomeRestaurantList from '@/components/HomeRestaurantList'
import { FILTRE_ACCUEIL, FiltreAccueil, ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase/client'

const FILTERS = Object.values(FILTRE_ACCUEIL)

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

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FiltreAccueil>(FILTRE_ACCUEIL.A_PROXIMITE)
  const { user, profile } = useAuth()
  const [tasteProfile, setTasteProfile] = useState<{ archetypeName: string; archetypeScore: number } | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_taste_profiles')
      .select('archetype_id, archetype_score')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!data) return
        const { data: arch } = await supabase
          .from('reco_archetypes')
          .select('nom')
          .eq('id', data.archetype_id)
          .maybeSingle()
        setTasteProfile({
          archetypeName: arch?.nom ?? data.archetype_id ?? '—',
          archetypeScore: Math.round(data.archetype_score ?? 0),
        })
      })
  }, [user])

  const handleFilterFallback = useCallback(() => {
    setActiveFilter(FILTRE_ACCUEIL.ETOILES)
  }, [])

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? null
  const prenom = fullName?.split(' ')[0] ?? null

  return (
    <div className="flex flex-col pb-20">
      <AppHeader />

      {/* Greeting */}
      <section className="px-4 pt-5 pb-4">
        <p className="text-michelin-gray text-sm">{prenom ? `Bonjour, ${prenom}` : 'Bonjour'}</p>
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
              {tasteProfile?.archetypeName ?? '—'}
            </p>
            <Link href={ROUTES.PROFIL} className="text-white/60 text-xs mt-1 flex items-center gap-1 hover:text-white transition-colors">
              Afficher mon profil <ArrowRight size={11} />
            </Link>
          </div>
          <CircularProgress value={tasteProfile?.archetypeScore ?? 0} />
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
          <Link href={ROUTES.RECHERCHE} className="text-michelin-red text-sm font-medium hover:opacity-80">
            Tout voir
          </Link>
        </div>
      </section>

      {/* Restaurant cards horizontal scroll */}
      <section className="mb-5">
        <HomeRestaurantList activeFilter={activeFilter} onFilterFallback={handleFilterFallback} />
      </section>

    </div>
  )
}
