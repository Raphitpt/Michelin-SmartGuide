// src/components/sensoriel/IntroScreen.tsx
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUp, staggerContainer } from '@/lib/motion'

type Props = {
  onStart: () => void
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="relative min-h-screen bg-[#191919] flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#2a1810]" />
      <div className="absolute bottom-0 left-0 right-0 h-[420px] bg-gradient-to-t from-[#191919] to-transparent" />

      <div className="relative z-10 px-8 h-20 flex items-center">
        <div className="flex gap-1 items-center text-[18px]">
          <span className="font-bold text-[#ba0b2f]">MICHELIN</span>
          <span className="font-normal text-white"> GUIDE</span>
        </div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col flex-1 justify-end px-6 pb-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeSlideUp}
          className="text-white font-bold text-[40px] leading-[1.1] mb-4"
        >
          Quel gastronome<br />êtes-vous ?
        </motion.h1>

        <motion.p
          variants={fadeSlideUp}
          className="text-white/70 text-[16px] leading-[1.5] mb-10 max-w-[310px]"
        >
          Quelques restaurants pour découvrir<br />votre profil gastronomique.
        </motion.p>

        <motion.button
          variants={fadeSlideUp}
          onClick={onStart}
          className="w-full bg-[#ba0b2f] text-white font-medium text-[16px] h-[52px] rounded-[4px] flex items-center justify-center active:opacity-90 transition-opacity"
        >
          Commencer le parcours
        </motion.button>

        <p className="text-white/50 text-[11px] font-bold mt-6 tracking-wide text-center">
          MICHELIN GUIDE
        </p>
      </motion.div>
    </div>
  )
}
