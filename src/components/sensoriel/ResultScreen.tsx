// src/components/sensoriel/ResultScreen.tsx
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { fadeSlideUp, staggerContainer } from '@/lib/motion'

type Props = {
  archetypeName: string
  archetypeDescription: string
  scorePct: number
  topTags: string[]
}

export default function ResultScreen({
  archetypeName,
  archetypeDescription,
  scorePct,
  topTags,
}: Props) {
  const router = useRouter()

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
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col justify-end px-6 pb-10 pt-8">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/')}
          className="w-full bg-[#ba0b2f] text-white font-medium text-[16px] h-[52px] rounded-[4px] flex items-center justify-center active:opacity-90 transition-opacity"
        >
          Explorer mes restaurants
        </motion.button>
      </div>
    </div>
  )
}
