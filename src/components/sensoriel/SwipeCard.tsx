// src/components/sensoriel/SwipeCard.tsx
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { RestaurantForSwipe } from '@/lib/sensoriel/queries'
import MichelinStar from '@/components/MichelinStar'

const SWIPE_THRESHOLD = 80

const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  D1: { bg: 'rgba(245,158,11,0.22)',  text: '#fbbf24' }, // cuisine — ambre
  D2: { bg: 'rgba(236,72,153,0.20)',  text: '#f472b6' }, // produits — rose
  D3: { bg: 'rgba(14,165,233,0.20)',  text: '#38bdf8' }, // sensoriel — bleu
  D4: { bg: 'rgba(34,197,94,0.20)',   text: '#4ade80' }, // contexte — vert
  D5: { bg: 'rgba(168,85,247,0.20)',  text: '#c084fc' }, // valeurs — violet
  D6: { bg: 'rgba(249,115,22,0.22)',  text: '#fb923c' }, // budget — orange
  D7: { bg: 'rgba(148,163,184,0.18)', text: '#94a3b8' }, // catégorie — gris
}

type Props = {
  restaurant: RestaurantForSwipe
  onSwipe: (restaurantId: string, liked: boolean) => void
  onPass: (restaurantId: string) => void
  isTop: boolean
  stackOffset?: { rotate: number; y: number; scale: number }
  zIndex?: number
}

export default function SwipeCard({ restaurant, onSwipe, isTop, stackOffset, zIndex }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-12, 0, 12])
  const likeOpacity = useTransform(x, [30, SWIPE_THRESHOLD], [0, 1])
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -30], [1, 0])
  const cardOpacity = useTransform(x, [-200, -120, 0, 120, 200], [0.6, 1, 1, 1, 0.6])

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe(restaurant.id, true)
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe(restaurant.id, false)
    }
  }

  const starCount = restaurant.michelin_stars ?? 0

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 rounded-[24px] overflow-hidden"
        style={{
          transform: `rotate(${stackOffset?.rotate ?? 0}deg) translateY(${stackOffset?.y ?? 0}px) scale(${stackOffset?.scale ?? 0.95})`,
          zIndex,
          background: '#1a1a18',
        }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.01 }}
    >
      <div className="w-full h-full rounded-[24px] overflow-hidden relative">
        {/* Photo plein format */}
        {restaurant.main_image ? (
          <img
            src={restaurant.main_image}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a18]" />
        )}

        {/* Gradient overlay bas */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,8,0.92) 0%, rgba(10,10,8,0.4) 45%, transparent 70%)',
          }}
        />

        {/* Overlay LIKE */}
        <motion.div
          className="absolute inset-0 rounded-[24px] flex items-start justify-start pt-14 pl-7"
          style={{ opacity: likeOpacity }}
        >
          <div
            className="border border-[#e8d5a3] rounded-[4px] px-3 py-1"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="text-[#e8d5a3] font-light text-[22px] tracking-[3px] uppercase">
              Pour moi
            </span>
          </div>
        </motion.div>

        {/* Overlay DISLIKE */}
        <motion.div
          className="absolute inset-0 rounded-[24px] flex items-start justify-end pt-14 pr-7"
          style={{ opacity: dislikeOpacity }}
        >
          <div
            className="border border-white/50 rounded-[4px] px-3 py-1"
            style={{ transform: 'rotate(8deg)' }}
          >
            <span className="text-white/70 font-light text-[22px] tracking-[3px] uppercase">
              Non merci
            </span>
          </div>
        </motion.div>

        {/* Infos bas de carte */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
          {starCount > 0 && (
            <div className="flex gap-0.5 mb-0.5">
              {Array.from({ length: starCount }, (_, i) => (
                <MichelinStar key={i} size={11} />
              ))}
            </div>
          )}
          {starCount === 0 && restaurant.michelin_label && (
            <p className="text-[#e8d5a3] text-[11px] tracking-[1.5px] uppercase font-medium">
              {restaurant.michelin_label}
            </p>
          )}

          <h2 className="text-white font-semibold text-[22px] leading-[1.15]">
            {restaurant.name}
          </h2>

          <p className="text-white/55 text-[13px] font-light tracking-wide">
            {restaurant.city}
            {restaurant.cuisine_style_label ? ` · ${restaurant.cuisine_style_label}` : ''}
          </p>

          {restaurant.traits.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {restaurant.traits.slice(0, 4).map(trait => {
                const color = DIMENSION_COLORS[trait.dimension_id] ?? { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.7)' }
                return (
                  <span
                    key={trait.code}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide"
                    style={{ background: color.bg, color: color.text, backdropFilter: 'blur(8px)' }}
                  >
                    {trait.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
