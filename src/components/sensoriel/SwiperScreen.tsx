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
  { rotate: -5, y: 0, scale: 1 },
  { rotate: 3, y: 8, scale: 0.97 },
  { rotate: -2, y: 16, scale: 0.94 },
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

  function handlePass(_restaurantId: string) {
    const next = currentIndex + 1
    if (next >= restaurants.length) {
      onComplete(swipes)
    } else {
      setCurrentIndex(next)
    }
  }

  if (remaining.length === 0) return null

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      <div className="bg-white h-20 flex items-center px-8">
        <div className="flex gap-1 items-center text-[18px]">
          <span className="font-bold text-[#ba0b2f]">MICHELIN</span>
          <span className="font-normal text-[#191919]"> GUIDE</span>
        </div>
      </div>

      <div className="px-6 pt-2 pb-1 flex flex-col gap-2">
        <p className="text-[#888] text-[13px] text-center">
          {currentIndex + 1} / {total}
        </p>
        <div className="h-[4px] bg-[#e0e0e0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#ba0b2f] rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4">
        <div className="relative h-[420px] mx-auto w-full max-w-[380px]">
          <AnimatePresence>
            {remaining.slice(0, 3).map((restaurant, i) => (
              <SwipeCard
                key={restaurant.id}
                restaurant={restaurant}
                onSwipe={recordSwipe}
                onPass={handlePass}
                isTop={i === 0}
                stackOffset={STACK_OFFSETS[i]}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="flex gap-2 justify-between">
          <button
            onClick={() => recordSwipe(remaining[0].id, false)}
            className="flex-1 h-[52px] rounded-[4px] flex items-center justify-center font-medium text-[16px] text-[#191919]"
          >
            ✗ Non
          </button>
          <button
            onClick={() => recordSwipe(remaining[0].id, true)}
            className="flex-[2] h-[52px] bg-[#ba0b2f] rounded-[4px] flex items-center justify-center font-medium text-[16px] text-white"
          >
            ♥ J&apos;adore
          </button>
          <button
            onClick={() => handlePass(remaining[0].id)}
            className="flex-1 h-[52px] border border-[#191919] rounded-[4px] flex items-center justify-center font-medium text-[16px] text-[#191919]"
          >
            → Passer
          </button>
        </div>
      </div>
    </div>
  )
}
