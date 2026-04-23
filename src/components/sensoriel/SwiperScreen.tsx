'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SwipeCard from './SwipeCard'
import type { RestaurantForSwipe } from '@/lib/sensoriel/queries'

type SwipeRecord = {
  restaurantId: string
  liked: boolean
  traitCodes: string[]
}

type Props = {
  restaurants: RestaurantForSwipe[]
  onComplete: (swipes: SwipeRecord[]) => void
}

const STACK_OFFSETS = [
  { rotate: 0,  y: 0,  scale: 1    },
  { rotate: 2,  y: 10, scale: 0.96 },
  { rotate: -1, y: 20, scale: 0.92 },
]

export default function SwiperScreen({ restaurants, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipes, setSwipes] = useState<SwipeRecord[]>([])

  const remaining = restaurants.slice(currentIndex)
  const total = restaurants.length
  const progress = total > 0 ? currentIndex / total : 0

  function recordSwipe(restaurantId: string, liked: boolean) {
    const restaurant = restaurants[currentIndex]
    const newSwipes = [...swipes, { restaurantId, liked, traitCodes: restaurant.trait_codes }]
    setSwipes(newSwipes)
    const next = currentIndex + 1
    if (next >= restaurants.length) {
      onComplete(newSwipes)
    } else {
      setCurrentIndex(next)
    }
  }

  function handlePass() {
    const next = currentIndex + 1
    if (next >= restaurants.length) {
      onComplete(swipes)
    } else {
      setCurrentIndex(next)
    }
  }

  if (remaining.length === 0) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f0d' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe" style={{ height: '64px' }}>
        <div className="flex gap-1 items-center text-[16px]">
          <span className="font-bold text-[#ba0b2f] tracking-wide">MICHELIN</span>
          <span className="font-light text-white/60"> GUIDE</span>
        </div>
        <span className="text-white/30 text-[12px] tracking-[1px]">
          {currentIndex + 1}<span className="mx-1 opacity-40">/</span>{total}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 px-6 pb-3">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className="rounded-full flex-1"
            style={{ height: '2px' }}
            animate={{
              background: i < currentIndex
                ? '#ba0b2f'
                : i === currentIndex
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(255,255,255,0.12)',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col justify-center px-4">
        <div className="relative mx-auto w-full max-w-[400px]" style={{ height: '480px' }}>
          <AnimatePresence mode="popLayout">
            {remaining.slice(0, 3).map((restaurant, i) => (
              <SwipeCard
                key={restaurant.id}
                restaurant={restaurant}
                onSwipe={recordSwipe}
                onPass={handlePass}
                isTop={i === 0}
                stackOffset={STACK_OFFSETS[i]}
                zIndex={3 - i}
              />
            ))}
          </AnimatePresence>

        </div>
      </div>

      {/* Actions */}
      <div className="px-8 pb-10 pt-4">
        <div className="flex items-center justify-center gap-6">

          {/* Non */}
          <motion.button
            onClick={() => recordSwipe(remaining[0].id, false)}
            className="flex flex-col items-center gap-2 group"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="w-[58px] h-[58px] rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white/30 text-[10px] tracking-[1.5px] uppercase font-medium">Non</span>
          </motion.button>

          {/* Passer */}
          <motion.button
            onClick={handlePass}
            className="flex flex-col items-center gap-2 group"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/20 text-[10px] tracking-[1.5px] uppercase font-medium">Passer</span>
          </motion.button>

          {/* J'adore */}
          <motion.button
            onClick={() => recordSwipe(remaining[0].id, true)}
            className="flex flex-col items-center gap-2 group"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="w-[58px] h-[58px] rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#ba0b2f' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C12 21 3 15 3 9a4.5 4.5 0 018.25-2.5A4.5 4.5 0 0121 9c0 6-9 12-9 12z" fill="white" />
              </svg>
            </div>
            <span className="text-white/40 text-[10px] tracking-[1.5px] uppercase font-medium">J&apos;adore</span>
          </motion.button>

        </div>

        {/* Hint swipe */}
        <p className="text-center text-white/20 text-[11px] mt-5 tracking-wide">
          ou glissez la carte
        </p>
      </div>
    </div>
  )
}
