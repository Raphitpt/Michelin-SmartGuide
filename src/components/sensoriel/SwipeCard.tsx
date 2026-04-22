// src/components/sensoriel/SwipeCard.tsx
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { RestaurantForSwipe } from '@/lib/sensoriel/queries'

const SWIPE_THRESHOLD = 80

type Props = {
  restaurant: RestaurantForSwipe
  onSwipe: (restaurantId: string, liked: boolean) => void
  onPass: (restaurantId: string) => void
  isTop: boolean
  stackOffset?: { rotate: number; y: number; scale: number }
}

export default function SwipeCard({ restaurant, onSwipe, onPass, isTop, stackOffset }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15])
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0])

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe(restaurant.id, true)
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe(restaurant.id, false)
    }
  }

  const michelinStars = restaurant.michelin_award_id ? '★' : null

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 bg-white rounded-[16px] shadow-lg"
        style={{
          transform: `rotate(${stackOffset?.rotate ?? 0}deg) translateY(${stackOffset?.y ?? 0}px) scale(${stackOffset?.scale ?? 0.95})`,
        }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <div className="w-full h-full bg-white rounded-[16px] shadow-lg overflow-hidden flex flex-col">
        <div className="h-[55%] bg-[#dcdcdc] relative flex-shrink-0">
          {restaurant.main_image && (
            <img
              src={restaurant.main_image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <motion.div
          className="absolute inset-0 rounded-[16px] bg-[rgba(26,122,74,0.28)] flex items-center justify-start pl-8 pt-16"
          style={{ opacity: likeOpacity }}
        >
          <p
            className="text-[#1a7a4a] font-bold text-[26px] whitespace-nowrap"
            style={{ transform: 'rotate(12deg)' }}
          >
            ♥ J&apos;ADORE
          </p>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-[16px] bg-[rgba(186,11,47,0.25)] flex items-center justify-start pl-8 pt-16"
          style={{ opacity: dislikeOpacity }}
        >
          <p
            className="text-[#ba0b2f] font-bold text-[24px] whitespace-nowrap"
            style={{ transform: 'rotate(-12deg)' }}
          >
            ✗ PAS MON STYLE
          </p>
        </motion.div>

        <div className="p-4 flex flex-col gap-1">
          {michelinStars && (
            <p className="text-[#ba0b2f] font-semibold text-[13px]">{michelinStars}</p>
          )}
          <p className="text-[#191919] font-semibold text-[18px]">{restaurant.name}</p>
          <p className="text-[#757575] font-normal text-[14px]">{restaurant.city}</p>
        </div>
      </div>
    </motion.div>
  )
}
