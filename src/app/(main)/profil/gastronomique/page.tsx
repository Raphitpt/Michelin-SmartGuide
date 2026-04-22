'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase/client'

type DimensionScore = {
  id: string
  nom: string
  question: string
  score: number
}

type ProfileData = {
  archetypeName: string
  archetypeDescription: string
  archetypeScore: number
  dimensionScores: DimensionScore[]
  swipeCount: number
}

const DIMENSION_COLORS: Record<string, string> = {
  D1: '#f59e0b',
  D2: '#ec4899',
  D3: '#0ea5e9',
  D4: '#22c55e',
  D5: '#a855f7',
  D6: '#f97316',
  D7: '#94a3b8',
}

const DIMENSION_HINTS: Record<string, { high: string; low: string }> = {
  D1: { high: 'Vous aimez explorer des origines culinaires variées', low: 'Vous préférez vous en tenir à quelques cuisines bien maîtrisées' },
  D2: { high: 'Certains ingrédients sont au cœur de vos préférences', low: 'Vous êtes ouvert à tout type de produit' },
  D3: { high: 'Vous avez des sensations en bouche très marquées (fumé, iodé, épicé…)', low: 'Vous appréciez des profils gustatifs plus discrets' },
  D4: { high: "Le cadre et l'occasion comptent autant que l'assiette", low: 'Vous mangez bien partout, peu importe le contexte' },
  D5: { high: "L'engagement du restaurant (bio, local, naturel) influence vos choix", low: "Vous privilégiez l'expérience gustative avant tout" },
  D6: { high: 'Vous investissez volontiers dans une belle expérience gastronomique', low: 'Vous cherchez la qualité au meilleur rapport qualité/prix' },
  D7: { high: "Vous avez un type d'établissement de prédilection", low: 'Vous aimez varier les formats (bistro, gastro, street food…)' },
}

export default function ProfilGastronomiquePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    async function load() {
      const { data: tp } = await supabase
        .from('user_taste_profiles')
        .select('archetype_id, archetype_score, score_vector, swipe_count')
        .eq('user_id', user!.id)
        .maybeSingle()

      if (!tp) { setLoading(false); return }

      const [{ data: arch }, { data: traits }, { data: dims }] = await Promise.all([
        supabase.from('reco_archetypes').select('nom, description').eq('id', tp.archetype_id).maybeSingle(),
        supabase.from('reco_traits').select('code, label, dimension_id'),
        supabase.from('reco_dimensions').select('id, nom, question').order('sort_order'),
      ])

      const vector = (tp.score_vector ?? {}) as Record<string, number>
      const traitByCode = new Map((traits ?? []).map(t => [t.code, t]))

      const rawDimScores: Record<string, number> = {}
      for (const [code, score] of Object.entries(vector)) {
        const t = traitByCode.get(code)
        if (t && score > 0) {
          rawDimScores[t.dimension_id] = (rawDimScores[t.dimension_id] ?? 0) + score
        }
      }
      const maxDimScore = Math.max(...Object.values(rawDimScores), 1)
      const dimensionScores: DimensionScore[] = (dims ?? [])
        .filter(d => rawDimScores[d.id] !== undefined)
        .map(d => ({
          id: d.id,
          nom: d.nom,
          question: d.question,
          score: Math.round((rawDimScores[d.id] / maxDimScore) * 100),
        }))
        .sort((a, b) => b.score - a.score)

      setProfileData({
        archetypeName: arch?.nom ?? tp.archetype_id,
        archetypeDescription: arch?.description ?? '',
        archetypeScore: Math.round(tp.archetype_score),
        dimensionScores,
        swipeCount: tp.swipe_count ?? 0,
      })
      setLoading(false)
    }

    load()
  }, [user])

  return (
    <div className="flex flex-col pb-20 min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="relative bg-[#191919] pb-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(186,11,47,0.6)] to-transparent pointer-events-none" />
        <div className="relative z-10 h-16 flex items-center px-4 gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex gap-1 items-center text-[18px]">
            <span className="font-bold text-[#ba0b2f]">MICHELIN</span>
            <span className="font-normal text-white"> GUIDE</span>
          </div>
        </div>

        {loading ? (
          <div className="relative z-10 px-6 h-24 flex items-center">
            <div className="w-48 h-8 bg-white/10 rounded-lg animate-pulse" />
          </div>
        ) : profileData ? (
          <motion.div
            className="relative z-10 px-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/60 text-[13px] tracking-[1.3px] mb-2">VOTRE PROFIL GASTRONOMIQUE</p>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-white font-bold text-[34px] leading-[1.1] flex-1">
                {profileData.archetypeName}
              </h1>
              <div className="bg-[#ba0b2f] rounded-[18px] px-3 py-1 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[16px]">{profileData.archetypeScore}%</span>
              </div>
            </div>
            <p className="text-white/75 text-[14px] leading-[1.5] mt-3 mb-2">
              {profileData.archetypeDescription}
            </p>
            <p className="text-white/40 text-[12px]">Basé sur {profileData.swipeCount} restaurants swipés</p>
          </motion.div>
        ) : (
          <div className="relative z-10 px-6">
            <p className="text-white/60 text-[13px]">Aucun profil trouvé</p>
          </div>
        )}
      </div>

      {/* Dimension scores */}
      {profileData && profileData.dimensionScores.length > 0 && (
        <motion.div
          className="px-4 pt-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-[12px] p-5 flex flex-col gap-4">
            <p className="text-[#191919] font-semibold text-[14px] tracking-[0.5px]">POURQUOI CE PROFIL</p>
            {profileData.dimensionScores.map((dim, i) => (
              <motion.div
                key={dim.id}
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[#555] text-[12px] truncate">{dim.nom}</p>
                    <button
                      onClick={() => setActiveTooltip(activeTooltip === dim.id ? null : dim.id)}
                      className="flex-shrink-0 w-4 h-4 rounded-full bg-[#e8e8e3] text-[#888] text-[10px] flex items-center justify-center"
                    >
                      i
                    </button>
                  </div>
                  <p className="text-[#191919] font-semibold text-[12px] flex-shrink-0">{dim.score}%</p>
                </div>
                <AnimatePresence>
                  {activeTooltip === dim.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] text-[#888] leading-[1.4] mb-1">{dim.question}</p>
                      <p className="text-[11px] leading-[1.4]">
                        <span className="text-[#22c55e] font-medium">↑ Élevé : </span>
                        <span className="text-[#555]">{DIMENSION_HINTS[dim.id]?.high}</span>
                      </p>
                      <p className="text-[11px] leading-[1.4] mt-0.5">
                        <span className="text-[#94a3b8] font-medium">↓ Faible : </span>
                        <span className="text-[#555]">{DIMENSION_HINTS[dim.id]?.low}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="h-[6px] bg-[#f0f0eb] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: DIMENSION_COLORS[dim.id] ?? '#ba0b2f' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ delay: 0.35 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
