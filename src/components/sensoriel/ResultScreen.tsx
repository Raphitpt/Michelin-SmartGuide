// src/components/sensoriel/ResultScreen.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { fadeSlideUp, staggerContainer } from '@/lib/motion'
import type { DimensionScore } from '@/app/(sensoriel)/parcours-sensoriel/page'

const DIMENSION_HINTS: Record<string, { high: string; low: string }> = {
  D1: { high: 'Vous aimez explorer des origines culinaires variées', low: 'Vous préférez vous en tenir à quelques cuisines bien maîtrisées' },
  D2: { high: 'Certains ingrédients sont au cœur de vos préférences', low: 'Vous êtes ouvert à tout type de produit' },
  D3: { high: 'Vous avez des sensations en bouche très marquées (fumé, iodé, épicé…)', low: 'Vous appréciez des profils gustatifs plus discrets' },
  D4: { high: 'Le cadre et l\'occasion comptent autant que l\'assiette', low: 'Vous mangez bien partout, peu importe le contexte' },
  D5: { high: 'L\'engagement du restaurant (bio, local, naturel) influence vos choix', low: 'Vous privilégiez l\'expérience gustative avant tout' },
  D6: { high: 'Vous investissez volontiers dans une belle expérience gastronomique', low: 'Vous cherchez la qualité au meilleur rapport qualité/prix' },
  D7: { high: 'Vous avez un type d\'établissement de prédilection', low: 'Vous aimez varier les formats (bistro, gastro, street food…)' },
}

const DIMENSION_COLORS: Record<string, string> = {
  D1: '#f59e0b', // cuisine — ambre
  D2: '#ec4899', // produits — rose
  D3: '#0ea5e9', // sensoriel — bleu
  D4: '#22c55e', // contexte — vert
  D5: '#a855f7', // valeurs — violet
  D6: '#f97316', // budget — orange
  D7: '#94a3b8', // catégorie — gris
}

type Props = {
  archetypeName: string
  archetypeDescription: string
  scorePct: number
  topTags: string[]
  dimensionScores: DimensionScore[]
}

export default function ResultScreen({
  archetypeName,
  archetypeDescription,
  scorePct,
  topTags,
  dimensionScores,
}: Props) {
  const router = useRouter()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const isBlankProfile = scorePct === 0 && dimensionScores.length === 0

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      <div className="relative bg-[#191919] pb-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(186,11,47,0.6)] to-transparent pointer-events-none" />

        <div className="relative z-10 h-20 flex items-center px-8">
          <div className="flex gap-1 items-center text-[18px]">
            <span className="font-bold text-[#ba0b2f]">MICHELIN</span>
            <span className="font-normal text-white"> GUIDE</span>
          </div>
        </div>

        <motion.div
          className="relative z-10 px-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-white/60 text-[13px] tracking-[1.3px] mb-2"
          >
            VOTRE PROFIL GASTRONOMIQUE
          </motion.p>

          {isBlankProfile ? (
            <motion.div variants={fadeSlideUp}>
              <h1 className="text-white font-bold text-[28px] leading-[1.2]">
                Difficile à cerner…
              </h1>
              <p className="text-white/75 text-[14px] leading-[1.5] mt-3">
                Vous avez rejeté tous les restaurants — votre palais reste un mystère. Explorez l&apos;application et affinez votre profil en ajoutant des favoris.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <motion.h1
                  variants={fadeSlideUp}
                  className="text-white font-bold text-[34px] leading-[1.1] flex-1"
                >
                  {archetypeName}
                </motion.h1>
                <motion.div
                  variants={fadeSlideUp}
                  className="bg-[#ba0b2f] rounded-[18px] px-3 py-1 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white font-bold text-[16px]">{scorePct}%</span>
                </motion.div>
              </div>

              <motion.p
                variants={fadeSlideUp}
                className="text-white/75 text-[14px] leading-[1.5] mt-3 mb-4"
              >
                {archetypeDescription}
              </motion.p>

              <motion.div variants={fadeSlideUp} className="flex gap-2 flex-wrap">
                {topTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#ba0b2f] text-white text-[13px] font-medium px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      <motion.div
        className="px-6 pt-6 pb-10 flex flex-col gap-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {!isBlankProfile && dimensionScores.length > 0 && (
          <div className="bg-white rounded-[12px] p-5 flex flex-col gap-4">
            <p className="text-[#191919] font-semibold text-[14px] tracking-[0.5px]">POURQUOI CE PROFIL</p>
            {dimensionScores.map((dim, i) => (
              <motion.div
                key={dim.id}
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
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
                    transition={{ delay: 0.55 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full bg-[#ba0b2f] text-white font-medium text-[16px] h-[52px] rounded-[4px] flex items-center justify-center active:opacity-90 transition-opacity"
        >
          Explorer mes restaurants
        </button>
      </motion.div>
    </div>
  )
}
