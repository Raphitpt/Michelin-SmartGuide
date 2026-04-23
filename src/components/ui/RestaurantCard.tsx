'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeSlideUpCard } from '@/lib/motion'

interface RestaurantCardProps {
  name: string
  location: string
  cuisine: string
  price: string
  stars?: 1 | 2 | 3
  image?: string
  href?: string
}

const STAR_KEYS = ['star-1', 'star-2', 'star-3'] as const

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-1">
      {STAR_KEYS.slice(0, count).map((key) => (
        <svg key={key} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1l1.545 3.09L12 4.635l-2.5 2.41.59 3.41L7 8.77l-3.09 1.685L4.5 7.045 2 4.635l3.455-.545L7 1z"
            fill="#E4002B"
          />
        </svg>
      ))}
    </div>
  )
}

export default function RestaurantCard({
  name,
  location,
  cuisine,
  price,
  stars,
  image,
  href = '#',
}: RestaurantCardProps) {
  return (
    <motion.div
      variants={fadeSlideUpCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Link href={href} className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-full aspect-[4/3] bg-michelin-light-gray">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
        </div>
        <div className="p-3">
          {stars && <StarRating count={stars} />}
          <p className="font-semibold text-michelin-black text-sm leading-snug">{name}</p>
          <p className="text-michelin-gray text-xs mt-0.5">{location}</p>
          <p className="text-michelin-gray text-xs mt-0.5">
            {cuisine}
            <span className="mx-1">·</span>
            {price}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
