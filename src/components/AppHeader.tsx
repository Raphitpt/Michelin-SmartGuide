import Link from 'next/link'
import { ChefHat } from 'lucide-react'

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white">
      <Link href="/" className="flex items-center gap-1">
        <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
        <span className="font-normal text-sm text-michelin-black">SmartGuide</span>
      </Link>
      <div className="relative">
        <button aria-label="Chef hat" className="absolute -top-3 left-1/2 -translate-x-1/2 text-michelin-black z-10">
          <ChefHat size={14} strokeWidth={1.5} />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#4A1C1C] flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-xs font-bold tracking-wide">RT</span>
        </div>
      </div>
    </header>
  )
}
