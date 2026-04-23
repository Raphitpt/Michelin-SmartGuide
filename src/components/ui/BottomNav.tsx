'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, Search, Heart, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { NAV_LABELS, ROUTES } from '@/constants'

const NAV_ITEMS = [
  { label: NAV_LABELS.ACCUEIL,   href: ROUTES.ACCUEIL,   icon: Home },
  { label: NAV_LABELS.ARTICLES,  href: ROUTES.ARTICLES,  icon: Newspaper },
  { label: NAV_LABELS.RECHERCHE, href: ROUTES.RECHERCHE, icon: Search },
  { label: NAV_LABELS.FAVORIS,   href: ROUTES.FAVORIS,   icon: Heart },
  { label: NAV_LABELS.PROFIL,    href: ROUTES.PROFIL,    icon: User },
]

const springTransition = { type: 'spring', stiffness: 300, damping: 30 } as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-michelin-light-gray flex z-50">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center pt-3 pb-4 gap-1 transition-colors ${
              active ? 'text-michelin-black' : 'text-michelin-gray'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span className={`text-[10px] ${active ? 'font-semibold' : 'font-normal'}`}>
              {label}
            </span>
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="w-5 h-0.5 bg-michelin-black rounded-full"
                transition={springTransition}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
