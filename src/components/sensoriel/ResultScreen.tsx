// src/components/sensoriel/ResultScreen.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { fadeSlideUp, staggerContainer } from '@/lib/motion'
import type { DimensionScore } from '@/app/(sensoriel)/parcours-sensoriel/page'

function buildPortrait(scores: DimensionScore[]): string {
  const strong = scores.filter(d => d.score >= 55).slice(0, 3)
  const weak = scores.filter(d => d.score < 45).slice(0, 2)

  const STRONG_PHRASES: Record<string, string> = {
    D1: 'vous aimez explorer les cuisines du monde sans frontières',
    D2: 'vous accordez une place centrale aux produits d\'exception',
    D3: 'vous cherchez des sensations fortes en bouche — fumé, iodé, épicé',
    D4: 'le cadre et l\'atmosphère font partie intégrante de votre repas',
    D5: 'les engagements du restaurant — bio, local, naturel — guident vos choix',
    D6: 'vous investissez volontiers dans une belle expérience gastronomique',
    D7: 'vous avez votre type d\'établissement de prédilection',
  }

  const WEAK_PHRASES: Record<string, string> = {
    D1: 'vous restez fidèle à quelques cuisines bien maîtrisées',
    D2: 'vous êtes ouvert à tous les ingrédients sans contrainte',
    D3: 'vous préférez des profils gustatifs subtils et équilibrés',
    D4: 'vous savez apprécier un bon repas peu importe le décor',
    D5: 'vous mettez l\'expérience gustative au-dessus de tout le reste',
    D6: 'vous savez trouver l\'excellence sans vous ruiner',
    D7: 'vous aimez varier les formats selon votre humeur',
  }

  const parts: string[] = []

  if (strong.length === 0 && weak.length === 0) {
    return 'Votre profil est encore en cours de calibration. Plus vous explorez, plus il s\'affine.'
  }

  if (strong.length > 0) {
    const phrases = strong.map(d => STRONG_PHRASES[d.id]).filter(Boolean)
    if (phrases.length === 1) parts.push(`Avant tout, ${phrases[0]}.`)
    else if (phrases.length === 2) parts.push(`Avant tout, ${phrases[0]}, et ${phrases[1]}.`)
    else parts.push(`Avant tout, ${phrases[0]}, ${phrases[1]}, et ${phrases[2]}.`)
  }

  if (weak.length > 0) {
    const phrases = weak.map(d => WEAK_PHRASES[d.id]).filter(Boolean)
    if (phrases.length === 1) parts.push(`Par ailleurs, ${phrases[0]}.`)
    else parts.push(`Par ailleurs, ${phrases[0]}, et ${phrases[1]}.`)
  }

  const sentence = parts.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  // D1 — Cuisine du monde : globe
  D1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3.6 9h16.8M3.6 15h16.8"/>
      <path d="M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9"/>
      <path d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9"/>
    </svg>
  ),
  // D2 — Produits d'exception : épi de blé
  D2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22V10"/>
      <path d="M12 10c0 0-2-2-2-4a2 2 0 0 1 4 0c0 2-2 4-2 4z"/>
      <path d="M9 14c-1.5 0-3-1-3-2.5S7 9 9 10"/>
      <path d="M15 14c1.5 0 3-1 3-2.5S17 9 15 10"/>
      <path d="M9 18c-1.5 0-3-1-3-2.5"/>
      <path d="M15 18c1.5 0 3-1 3-2.5"/>
    </svg>
  ),
  // D3 — Sensations (fumé, épicé) : flamme
  D3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10z"/>
      <path d="M12 12c0 2-1.5 3-1.5 4.5a1.5 1.5 0 0 0 3 0C13.5 15 12 14 12 12z"/>
    </svg>
  ),
  // D4 — Cadre & atmosphère : bougie
  D4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21h6"/>
      <rect x="9" y="10" width="6" height="11" rx="1"/>
      <path d="M12 10V7"/>
      <path d="M12 7c0-2 2-3 2-4.5a2 2 0 0 0-4 0C10 4 12 5 12 7z"/>
    </svg>
  ),
  // D5 — Valeurs (bio, local) : feuille
  D5: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 7-11 8-11s8 6 8 11a7 7 0 0 1-7 7h-2z"/>
      <path d="M12 2v20"/>
    </svg>
  ),
  // D6 — Budget : signe €
  D6: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 7.5A6 6 0 1 0 17 16.5"/>
      <path d="M5 11h9"/>
      <path d="M5 13h9"/>
    </svg>
  ),
  // D7 — Type d'établissement : couvert
  D7: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 2v7c0 1.66 1.34 3 3 3s3-1.34 3-3V2"/>
      <path d="M6 2v20"/>
      <path d="M15 2v6a3 3 0 0 0 3 3v11"/>
      <path d="M18 2v6"/>
    </svg>
  ),
}

const DIMENSION_META: Record<string, {
  icon: string
  color: string
  bg: string
  high: string
  low: string
}> = {
  D1: {
    icon: '🌍',
    color: '#f59e0b',
    bg: '#fffbeb',
    high: 'Curieux des cuisines du monde',
    low: 'Fidèle à quelques cuisines maîtrisées',
  },
  D2: {
    icon: '🫐',
    color: '#ec4899',
    bg: '#fdf2f8',
    high: 'Attaché à des produits d\'exception',
    low: 'Ouvert à tous les ingrédients',
  },
  D3: {
    icon: '🌶️',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    high: 'Sensations fortes : fumé, iodé, épicé',
    low: 'Préfère des profils gustatifs discrets',
  },
  D4: {
    icon: '🕯️',
    color: '#22c55e',
    bg: '#f0fdf4',
    high: 'Le cadre compte autant que l\'assiette',
    low: 'Mange bien partout, peu importe le décor',
  },
  D5: {
    icon: '🌱',
    color: '#a855f7',
    bg: '#faf5ff',
    high: 'Sensible au bio, local et naturel',
    low: 'L\'expérience gustative avant tout',
  },
  D6: {
    icon: '💎',
    color: '#f97316',
    bg: '#fff7ed',
    high: 'Investit volontiers dans le gastronomique',
    low: 'Cherche la qualité au meilleur prix',
  },
  D7: {
    icon: '🏛️',
    color: '#64748b',
    bg: '#f8fafc',
    high: 'A un type d\'établissement favori',
    low: 'Aime varier : bistro, gastro, street food…',
  },
}

type Props = {
  archetypeName: string
  archetypeDescription: string
  scorePct: number
  topTags: string[]
  dimensionScores: DimensionScore[]
  onContinue?: () => void
  hasMatch?: boolean
}

export default function ResultScreen({
  archetypeName,
  archetypeDescription,
  scorePct,
  topTags,
  dimensionScores,
  onContinue,
  hasMatch,
}: Props) {
  const router = useRouter()

  const isBlankProfile = scorePct === 0 && dimensionScores.length === 0
  const portrait = isBlankProfile ? null : buildPortrait(dimensionScores)

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">

      {/* Header sombre */}
      <div className="relative pb-16" style={{ background: '#191919' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(186,11,47,0.5) 0%, transparent 60%)' }}
        />
        {/* Fondu vers le fond de page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f5f5f0)' }}
        />

        <div className="relative z-10 h-16 flex items-center px-6">
          <div className="flex gap-1 items-center text-[16px]">
            <span className="font-bold text-[#ba0b2f] tracking-wide">MICHELIN</span>
            <span className="font-light text-white/60"> GUIDE</span>
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
            className="text-white/40 text-[11px] tracking-[2px] uppercase mb-3"
          >
            Votre profil gastronomique
          </motion.p>

          {isBlankProfile ? (
            <motion.div variants={fadeSlideUp}>
              <h1 className="text-white font-semibold text-[28px] leading-[1.2]">
                Difficile à cerner…
              </h1>
              <p className="text-white/60 text-[14px] leading-[1.6] mt-3">
                Vous avez rejeté tous les restaurants — votre palais reste un mystère. Explorez l&apos;application et affinez votre profil.
              </p>
            </motion.div>
          ) : (
            <>
              <motion.h1
                variants={fadeSlideUp}
                className="text-white font-bold text-[36px] leading-[1.1] mb-3"
              >
                {archetypeName}
              </motion.h1>

              <motion.p
                variants={fadeSlideUp}
                className="text-white/65 text-[14px] leading-[1.65] mb-4"
              >
                {archetypeDescription}
              </motion.p>

              {portrait && (
                <motion.div
                  variants={fadeSlideUp}
                  className="rounded-[12px] px-4 py-3 mb-5"
                  style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
                >
                  <p className="text-white/40 text-[10px] tracking-[1.8px] uppercase mb-1.5">En résumé</p>
                  <p className="text-white/85 text-[13px] leading-[1.65]">{portrait}</p>
                </motion.div>
              )}

              {topTags.length > 0 && (
                <motion.div variants={fadeSlideUp} className="flex gap-2 flex-wrap">
                  {topTags.map(tag => (
                    <span
                      key={tag}
                      className="text-white/80 text-[12px] font-medium px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Corps */}
      <motion.div
        className="px-4 pt-5 pb-10 flex flex-col gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {!isBlankProfile && dimensionScores.length > 0 && (
          <>
            <p className="text-[#888] text-[11px] tracking-[1.5px] uppercase px-2 mb-1">
              Ce qui vous définit
            </p>

            {dimensionScores.map((dim, i) => {
              const meta = DIMENSION_META[dim.id]
              if (!meta) return null
              const isStrong = dim.score >= 50
              const phrase = isStrong ? meta.high : meta.low

              return (
                <motion.div
                  key={dim.id}
                  className="bg-white rounded-[14px] px-4 py-4 flex items-center gap-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, ease: 'easeOut' }}
                >
                  {/* Icône */}
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {DIMENSION_ICONS[dim.id]}
                  </div>

                  {/* Texte */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#aaa] text-[10px] tracking-[1px] uppercase mb-1">
                      {dim.nom}
                    </p>
                    <p className="text-[#191919] font-medium text-[14px] leading-[1.35]">
                      {phrase}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </>
        )}

        <motion.button
          onClick={hasMatch && onContinue ? onContinue : () => router.push('/')}
          className="mt-2 w-full bg-[#ba0b2f] text-white font-medium text-[15px] h-[52px] rounded-[6px] flex items-center justify-center active:opacity-90 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + dimensionScores.length * 0.06 }}
        >
          {hasMatch && onContinue ? 'Voir mon restaurant coup de cœur' : 'Explorer mes restaurants'}
        </motion.button>
      </motion.div>
    </div>
  )
}
