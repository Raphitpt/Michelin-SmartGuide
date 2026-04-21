'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Database } from '@/types/supabase'
import { slideImageVariants, slideImageTransition } from '@/lib/motion'

type RestaurantImage = Database['public']['Tables']['restaurant_images']['Row']

type Props = {
  images: RestaurantImage[]
  fallbackColor?: string
}

export default function ImageSlider({ images, fallbackColor = 'from-[#6B3A1F] to-[#C4722A]' }: Readonly<Props>) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const startX = useRef<number | null>(null)

  if (!images.length) {
    return <div className={`w-full h-64 bg-gradient-to-br ${fallbackColor}`} />
  }

  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % images.length)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    startX.current = null
  }

  return (
    <div
      className="relative w-full h-64 overflow-hidden bg-gray-100"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.img
          key={index}
          src={images[index].url}
          alt={`Photo ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          custom={direction}
          variants={slideImageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideImageTransition}
        />
      </AnimatePresence>

      {/* Counter */}
      <span className="absolute bottom-3 left-4 text-white text-xs bg-black/40 px-2 py-0.5 rounded-full z-10">
        {index + 1} / {images.length}
      </span>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1)
                setIndex(i)
              }}
              className={`w-1.5 h-1.5 rounded-full transition-opacity ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
