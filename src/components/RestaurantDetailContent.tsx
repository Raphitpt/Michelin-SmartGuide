'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, ChevronRight, Phone, Clock, Shirt, CheckCircle, ThumbsUp, ThumbsDown, ExternalLink, PhoneCall } from 'lucide-react'
import { useState } from 'react'
import MichelinStar from '@/components/MichelinStar'
import BackButton from '@/components/BackButton'
import ImageSlider from '@/components/ImageSlider'
import { staggerContainerDetail, fadeSlideUp } from '@/lib/motion'
import { Database } from '@/types/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRestaurantActions } from '@/hooks/useRestaurantActions'

type RestaurantImage = Database['public']['Tables']['restaurant_images']['Row']
type MichelinAward   = Database['public']['Tables']['michelin_awards']['Row']
type PriceCategory   = Database['public']['Tables']['price_categories']['Row']
type Restaurant      = Database['public']['Tables']['restaurants']['Row'] & {
  michelin_awards:    MichelinAward | null
  price_categories:   PriceCategory | null
  restaurant_images:  RestaurantImage[]
}

type TraitInfo = { code: string; label: string; dimension_id: string }

const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  D1: { bg: '#fef3c7', text: '#92400e' },
  D2: { bg: '#fce7f3', text: '#9d174d' },
  D3: { bg: '#e0f2fe', text: '#075985' },
  D4: { bg: '#dcfce7', text: '#166534' },
  D5: { bg: '#f3e8ff', text: '#6b21a8' },
  D6: { bg: '#fff7ed', text: '#9a3412' },
  D7: { bg: '#f1f5f9', text: '#334155' },
}

const INFO_ROWS = [
  { icon: Clock, label: "Ouvert jusqu'à 23h", sub: "Aujourd'hui" },
  { icon: Shirt, label: 'Tenue élégante',      sub: 'Recommandée' },
  { icon: Phone, label: '01 82 82 10 30',      sub: 'Appeler' },
]

const itemTransition = { duration: 0.4, ease: 'easeOut' as const }

export default function RestaurantDetailContent({ restaurant, traits = [] }: { restaurant: Restaurant; traits?: TraitInfo[] }) {
  const { user } = useAuth()
  const { liked, visited, toggleLike, toggleVisited, rateVisit } = useRestaurantActions(user?.id, restaurant.id)
  const [showRating, setShowRating] = useState(false)
  const [rated, setRated] = useState<boolean | null>(null)

  async function handleToggleVisited() {
    const wasVisited = visited
    await toggleVisited()
    if (!wasVisited) setShowRating(true)
    else { setShowRating(false); setRated(null) }
  }

  async function handleRate(enjoyed: boolean) {
    setRated(enjoyed)
    setShowRating(false)
    await rateVisit(enjoyed)
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="relative w-full h-64 shrink-0">
        <ImageSlider images={restaurant.restaurant_images.sort((a, b) => a.position - b.position)} />
        <BackButton />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleLike}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              className={liked ? 'text-michelin-red' : 'text-michelin-black'}
              fill={liked ? '#E4002B' : 'none'}
            />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow">
            <Share2 size={16} className="text-michelin-black" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <motion.div
        className="px-4 pt-4 flex flex-col gap-4"
        variants={staggerContainerDetail}
        initial="hidden"
        animate="visible"
      >
        {restaurant.michelin_awards && (
          <motion.div variants={fadeSlideUp} transition={itemTransition} className="self-start flex items-center gap-1.5 bg-michelin-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
            {restaurant.michelin_awards.stars > 0 ? (
              <>
                {Array.from({ length: restaurant.michelin_awards.stars }, (_, i) => (
                  <MichelinStar key={i} size={10} />
                ))}
                <span>
                  {restaurant.michelin_awards.stars} étoile{restaurant.michelin_awards.stars > 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span>{restaurant.michelin_awards.label}</span>
            )}
          </motion.div>
        )}

        <motion.div variants={fadeSlideUp} transition={itemTransition}>
          <h1 className="text-michelin-black font-bold text-3xl leading-tight">{restaurant.name}</h1>
          <p className="text-michelin-gray text-sm mt-1">
            {restaurant.city} · Française moderne ·{' '}
            {restaurant.price_categories?.price_avg_min_eur && restaurant.price_categories?.price_avg_max_eur
              ? `(${restaurant.price_categories.price_avg_min_eur}–${restaurant.price_categories.price_avg_max_eur}€)`
              : restaurant.price_categories?.price_avg_min_eur
              ? `(dès ${restaurant.price_categories.price_avg_min_eur}€)`
              : null}
          </p>
        </motion.div>

        <motion.p variants={fadeSlideUp} transition={itemTransition} className="text-michelin-black text-sm leading-relaxed">
          Dans un hôtel particulier du 8<sup>e</sup>, le chef Christophe Pelé signe une cuisine précise et inspirée,
          où chaque produit trouve sa juste place.
        </motion.p>

        {traits.length > 0 && (
          <motion.div variants={fadeSlideUp} transition={itemTransition} className="flex flex-wrap gap-2">
            {traits.map(trait => {
              const color = DIMENSION_COLORS[trait.dimension_id] ?? { bg: '#f0f0eb', text: '#555' }
              return (
                <span
                  key={trait.code}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {trait.label}
                </span>
              )
            })}
          </motion.div>
        )}

        <motion.div variants={fadeSlideUp} transition={itemTransition} className="flex flex-col divide-y divide-michelin-light-gray">
          {INFO_ROWS.map(({ icon: Icon, label, sub }) => (
            <button key={label} className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-michelin-black shrink-0" strokeWidth={1.5} />
                <div className="text-left">
                  <p className="text-michelin-black text-sm font-medium">{label}</p>
                  <p className="text-michelin-gray text-xs">{sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-michelin-gray shrink-0" />
            </button>
          ))}
        </motion.div>

        {/* Réservation */}
        <motion.div variants={fadeSlideUp} transition={itemTransition}>
          {restaurant.online_booking && restaurant.url ? (
            <a
              href={restaurant.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-3 bg-michelin-black text-white px-5 py-4 rounded-xl active:opacity-80 transition-opacity"
            >
              <div>
                <p className="font-semibold text-[15px]">Réserver une table</p>
                <p className="text-white/50 text-[12px] mt-0.5">Réservation en ligne disponible</p>
              </div>
              <ExternalLink size={18} className="text-white/60 flex-shrink-0" strokeWidth={1.5} />
            </a>
          ) : restaurant.phone ? (
            <a
              href={`tel:${restaurant.phone}`}
              className="w-full flex items-center justify-between gap-3 bg-michelin-black text-white px-5 py-4 rounded-xl active:opacity-80 transition-opacity"
            >
              <div>
                <p className="font-semibold text-[15px]">Réserver une table</p>
                <p className="text-white/50 text-[12px] mt-0.5">{restaurant.phone}</p>
              </div>
              <PhoneCall size={18} className="text-white/60 flex-shrink-0" strokeWidth={1.5} />
            </a>
          ) : null}
        </motion.div>

        {/* J'ai visité */}
        <motion.div variants={fadeSlideUp} transition={itemTransition} className="flex flex-col gap-3">
          <button
            onClick={handleToggleVisited}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
              visited
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-michelin-black/20 text-michelin-black hover:border-michelin-black/50'
            }`}
          >
            <CheckCircle size={16} strokeWidth={1.5} />
            {visited
              ? rated === true ? 'Visité · J\'ai adoré ♥' : rated === false ? 'Visité · Pas mon style' : 'Visité !'
              : "J'ai visité ce restaurant"}
          </button>

          <AnimatePresence>
            {showRating && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-michelin-black rounded-xl px-4 py-4 flex flex-col gap-3"
              >
                <p className="text-white text-sm font-medium text-center">Vous avez aimé ?</p>
                <p className="text-white/50 text-xs text-center leading-relaxed">
                  Votre avis affine votre profil gastronomique
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRate(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/20 text-white/70 text-sm font-medium active:opacity-70 transition-opacity"
                  >
                    <ThumbsDown size={14} strokeWidth={1.5} />
                    Pas vraiment
                  </button>
                  <button
                    onClick={() => handleRate(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-michelin-red text-white text-sm font-medium active:opacity-80 transition-opacity"
                  >
                    <ThumbsUp size={14} strokeWidth={1.5} />
                    J&apos;ai adoré
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

    </div>
  )
}
