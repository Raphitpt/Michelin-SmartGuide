'use client'

import { motion } from 'framer-motion'
import { Heart, Share2, ChevronRight, Phone, Clock, Shirt, CheckCircle } from 'lucide-react'
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

const INFO_ROWS = [
  { icon: Clock, label: "Ouvert jusqu'à 23h", sub: "Aujourd'hui" },
  { icon: Shirt, label: 'Tenue élégante',      sub: 'Recommandée' },
  { icon: Phone, label: '01 82 82 10 30',      sub: 'Appeler' },
]

const itemTransition = { duration: 0.4, ease: 'easeOut' as const }

export default function RestaurantDetailContent({ restaurant }: { restaurant: Restaurant }) {
  const { user } = useAuth()
  const { liked, visited, toggleLike, toggleVisited } = useRestaurantActions(user?.id, restaurant.id)

  return (
    <div className="flex flex-col pb-28">
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

        {/* J'ai visité */}
        <motion.div variants={fadeSlideUp} transition={itemTransition}>
          <button
            onClick={toggleVisited}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
              visited
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-michelin-black/20 text-michelin-black hover:border-michelin-black/50'
            }`}
          >
            <CheckCircle size={16} strokeWidth={1.5} />
            {visited ? 'Visité !' : "J'ai visité ce restaurant"}
          </button>
        </motion.div>
      </motion.div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3">
        <button className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded hover:opacity-90 transition-opacity">
          Réserver une table
        </button>
      </div>
    </div>
  )
}
