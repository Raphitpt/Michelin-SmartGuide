'use client'

import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'

function getInitiales(fullName: string | null | undefined) {
  if (!fullName) return null
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function AppHeader() {
  const { user, profile } = useAuth()

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? null
  const initiales = getInitiales(fullName)
  const profilHref = user ? ROUTES.PROFIL : ROUTES.LOGIN

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white">
      <Link href="/" className="flex items-center gap-1">
        <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
        <span className="font-normal text-sm text-michelin-black">SmartGuide</span>
      </Link>

      <Link href={profilHref} className="relative" aria-label="Profil">
        {initiales && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <ChefHat size={14} strokeWidth={1.5} className="text-michelin-black" />
          </span>
        )}
        <div className="w-9 h-9 rounded-full bg-[#4A1C1C] flex items-center justify-center shrink-0 mt-1">
          {initiales ? (
            <span className="text-white text-xs font-bold tracking-wide">{initiales}</span>
          ) : (
            <span className="text-white/60 text-xs font-medium">→</span>
          )}
        </div>
      </Link>
    </header>
  )
}
