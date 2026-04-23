'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HEADER_NAV_LABELS, ROUTES } from '@/constants'

const NAV_LINKS = [
  { label: HEADER_NAV_LABELS.RESTAURANTS,      href: ROUTES.RESTAURANTS },
  { label: HEADER_NAV_LABELS.HEBERGEMENTS,     href: '/hebergements' },
  { label: HEADER_NAV_LABELS.GUIDES_DE_VOYAGE, href: '/guides' },
  { label: HEADER_NAV_LABELS.MAGAZINE,         href: '/magazine' },
  { label: HEADER_NAV_LABELS.MES_LISTES,       href: '/mes-listes' },
]

type Variant = 'light' | 'dark' | 'transparent'

interface HeaderProps {
  variant?: Variant
}

const styles = {
  light: {
    wrapper: 'bg-white text-michelin-black',
    nav: 'text-michelin-black hover:text-michelin-red',
    toggle: 'bg-michelin-light-gray',
    toggleIcon: 'bg-michelin-gray',
    burger: 'text-michelin-black',
    mobileMenu: 'bg-white',
    mobileLink: 'text-michelin-black hover:text-michelin-red border-michelin-light-gray',
  },
  dark: {
    wrapper: 'bg-michelin-black text-white',
    nav: 'text-white hover:text-michelin-yellow',
    toggle: 'bg-michelin-gray',
    toggleIcon: 'bg-white',
    burger: 'text-white',
    mobileMenu: 'bg-michelin-black',
    mobileLink: 'text-white hover:text-michelin-yellow border-michelin-gray',
  },
  transparent: {
    wrapper: 'bg-transparent text-white',
    nav: 'text-white hover:text-michelin-yellow',
    toggle: 'bg-white/20',
    toggleIcon: 'bg-white',
    burger: 'text-white',
    mobileMenu: 'bg-michelin-black/95',
    mobileLink: 'text-white hover:text-michelin-yellow border-michelin-gray',
  },
}

export default function Header({ variant = 'light' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const s = styles[variant]

  return (
    <header className={`w-full ${s.wrapper}`}>
      <div className="flex items-center justify-between px-4 h-16 md:px-8 lg:px-12 max-w-screen-xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-michelin-red font-bold text-base tracking-widest uppercase">
            Michelin
          </span>
          <span className="font-light text-base tracking-widest uppercase">
            Guide
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${s.nav}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Circle toggle */}
          <button
            aria-label="Options"
            className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center ${s.toggle}`}
          >
            <span className={`w-4 h-4 rounded-full ${s.toggleIcon}`} />
          </button>

          {/* Hamburger */}
          <button
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            className={`flex items-center justify-center w-9 h-9 ${s.burger}`}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="17" y2="17" />
                <line x1="17" y1="3" x2="3" y2="17" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="5" x2="18" y2="5" />
                <line x1="2" y1="10" x2="18" y2="10" />
                <line x1="2" y1="15" x2="18" y2="15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`md:hidden ${s.mobileMenu}`}>
          <nav className="flex flex-col px-4 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`py-4 text-sm font-medium border-b transition-colors ${s.mobileLink}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
