// src/components/sensoriel/MatchScreen.tsx
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { fadeSlideUp, staggerContainer } from '@/lib/motion'
import MichelinStar from '@/components/MichelinStar'
import type { MatchRestaurant } from '@/lib/sensoriel/queries'

type Props = {
  archetypeName: string
  restaurant: MatchRestaurant | null
  hasGeoloc: boolean
  onRequestGeoloc: () => void
}

export default function MatchScreen({ archetypeName, restaurant, hasGeoloc, onRequestGeoloc }: Props) {
  const router = useRouter()

  const starCount = restaurant?.michelin_stars ?? 0

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      <div className="relative bg-[#191919] pb-10">
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
            VOS RESTAURANTS
          </motion.p>

          <motion.h1
            variants={fadeSlideUp}
            className="text-white font-bold text-[34px] leading-[1.1] mb-2"
          >
            C&apos;est un match.
          </motion.h1>

          <motion.p
            variants={fadeSlideUp}
            className="text-white/60 text-[14px] leading-[1.5]"
          >
            Sélectionné pour votre profil <span className="text-white/90 font-medium">{archetypeName}</span>
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="px-6 pt-6 pb-10 flex flex-col gap-5 flex-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {restaurant ? (
          <div className="bg-white rounded-[16px] shadow-lg overflow-hidden">
            <div className="relative h-[220px] bg-[#dcdcdc]">
              {restaurant.main_image && (
                <img
                  src={restaurant.main_image}
                  alt={restaurant.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${!hasGeoloc ? 'blur-sm scale-105' : ''}`}
                />
              )}

              {!hasGeoloc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <MapPin size={28} className="text-white drop-shadow" />
                  <p className="text-white font-semibold text-[15px] leading-[1.4] drop-shadow">
                    Autorisez la localisation pour voir le restaurant le plus proche
                  </p>
                  <button
                    onClick={onRequestGeoloc}
                    className="bg-white text-[#191919] font-medium text-[13px] px-4 py-2 rounded-[4px] active:opacity-80 transition-opacity"
                  >
                    Autoriser
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-1.5">
              {starCount > 0 ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: starCount }, (_, i) => (
                    <MichelinStar key={i} size={12} />
                  ))}
                </div>
              ) : restaurant.michelin_label ? (
                <p className="text-[#ba0b2f] font-medium text-[11px]">{restaurant.michelin_label}</p>
              ) : null}

              <p className="text-[#191919] font-semibold text-[20px] leading-[1.2]">{restaurant.name}</p>

              <p className="text-[#757575] text-[14px]">
                {restaurant.city}
                {restaurant.cuisine_style_label ? ` · ${restaurant.cuisine_style_label}` : ''}
              </p>

              {hasGeoloc && restaurant.distance_km != null && (
                <p className="text-[#ba0b2f] text-[13px] font-medium flex items-center gap-1">
                  <MapPin size={12} />
                  {restaurant.distance_km < 1
                    ? `${Math.round(restaurant.distance_km * 1000)} m`
                    : `${restaurant.distance_km} km`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] p-6 text-center text-[#888] text-[14px]">
            Aucun restaurant trouvé pour votre profil.
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#ba0b2f] text-white font-medium text-[16px] h-[52px] rounded-[4px] flex items-center justify-center active:opacity-90 transition-opacity"
          >
            Explorer mes restaurants
          </button>
        </div>
      </motion.div>
    </div>
  )
}
