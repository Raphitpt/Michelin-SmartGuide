// src/components/sensoriel/SwipeCard.tsx
'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { RestaurantForSwipe } from '@/lib/sensoriel/queries'
import MichelinStar from '@/components/ui/MichelinStar'

const SWIPE_THRESHOLD = 80

const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  D1: { bg: 'rgba(245,158,11,0.22)', text: '#FBBF24' }, // cuisine — ambre
  D2: { bg: 'rgba(236,72,153,0.20)', text: '#F472B6' }, // produits — rose
  D3: { bg: 'rgba(14,165,233,0.20)', text: '#38BDF8' }, // sensoriel — bleu
  D4: { bg: 'rgba(34,197,94,0.20)', text: '#4ADE80' }, // contexte — vert
  D5: { bg: 'rgba(168,85,247,0.20)', text: '#C084FC' }, // valeurs — violet
  D6: { bg: 'rgba(249,115,22,0.22)', text: '#FB923C' }, // budget — orange
  D7: { bg: 'rgba(148,163,184,0.18)', text: '#94A3B8' }, // catégorie — gris
}

type Props = {
  restaurant: RestaurantForSwipe
  onSwipe: (restaurantId: string, liked: boolean) => void
  onPass: (restaurantId: string) => void
  isTop: boolean
  stackOffset?: { rotate: number; y: number; scale: number }
  zIndex?: number
  photoIndex?: number
}

export default function SwipeCard({ restaurant, onSwipe, isTop, stackOffset, zIndex, photoIndex = 0 }: Props) {
  const images = restaurant.images?.length ? restaurant.images : (restaurant.main_image ? [restaurant.main_image] : [])
  const [currentPhoto, setCurrentPhoto] = useState(photoIndex)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-12, 0, 12])
  const likeOpacity = useTransform(x, [30, SWIPE_THRESHOLD], [0, 1])
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -30], [1, 0])
  const cardOpacity = useTransform(x, [-200, -120, 0, 120, 200], [0.6, 1, 1, 1, 0.6])

  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerStart.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
    x.set(0)
}

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    if (Math.abs(dx) > 5) {
      isDragging.current = true
      x.set(dx)
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 8) {
      if (images.length > 1) {
        const mid = (e.currentTarget as HTMLElement).getBoundingClientRect().left + (e.currentTarget as HTMLElement).offsetWidth / 2
        if (e.clientX < mid) {
          setCurrentPhoto(i => Math.max(0, i - 1))
        } else {
          setCurrentPhoto(i => Math.min(images.length - 1, i + 1))
        }
      }
    } else if (Math.abs(dx) > SWIPE_THRESHOLD) {
      onSwipe(restaurant.id, dx > 0)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }

    pointerStart.current = null
    isDragging.current = false
  }

  const starCount = restaurant.michelin_stars ?? 0

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 rounded-[24px] overflow-hidden"
        style={{
          transform: `rotate(${stackOffset?.rotate ?? 0}deg) translateY(${stackOffset?.y ?? 0}px) scale(${stackOffset?.scale ?? 0.95})`,
          zIndex,
          background: '#1A1A18',
        }}
      />
    )
  }

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{ x, rotate, zIndex, opacity: cardOpacity, cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStart.current = null; animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 }) }}
    >
      <div className="w-full h-full rounded-[24px] overflow-hidden relative">
        {/* Photo plein format */}
        {images.length > 0 ? (
          <img
            src={images[currentPhoto]}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a18]" />
        )}


        {/* Dots indicateurs */}
        {images.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
            {images.map((_, i) => (
              <div
                key={i}
                className="h-[3px] rounded-full transition-all duration-200"
                style={{
                  width: i === currentPhoto ? 20 : 6,
                  background: i === currentPhoto ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
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
            <div className="self-start flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm mb-0.5">
              {Array.from({ length: starCount }, (_, i) => (
                <MichelinStar key={i} size={11} />
              ))}
              <span className="text-[#e8d5a3] text-[11px] tracking-[1.5px] uppercase font-medium ml-1">
                {starCount === 1 ? 'Étoile' : 'Étoiles'}
              </span>
            </div>
          )}
          {starCount === 0 && restaurant.michelin_label && (
            <span className="self-start px-2.5 py-1 rounded-full bg-black/60 text-[#e8d5a3] text-[11px] tracking-[1.5px] uppercase font-medium backdrop-blur-sm">
              {restaurant.michelin_label}
            </span>
          )}

          <h2 className="text-white font-semibold text-[22px] leading-[1.15]">
            {restaurant.name}
          </h2>

          <p className="text-white/55 text-[13px] font-light tracking-wide">
            {restaurant.city}
            {restaurant.cuisine_style_label ? ` · ${restaurant.cuisine_style_label}` : ''}
            {restaurant.price_categories?.[0]?.price_avg_min_eur && restaurant.price_categories?.[0]?.price_avg_max_eur
              ? ` · ${restaurant.price_categories[0].price_avg_min_eur}–${restaurant.price_categories[0].price_avg_max_eur}€`
              : restaurant.price_categories?.[0]?.price_avg_min_eur
                ? ` · dès ${restaurant.price_categories[0].price_avg_min_eur}€`
                : null}
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
