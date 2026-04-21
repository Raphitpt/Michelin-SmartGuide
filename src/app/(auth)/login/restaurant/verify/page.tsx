'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Star, Upload } from 'lucide-react'

export default function RestaurantVerifyPage() {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}>

      {/* Mini header */}
      <header className="bg-white px-4 py-3 flex items-center shrink-0">
        <Link href="/login" className="flex items-center gap-1">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-michelin-black">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-10">

        {/* Restaurant selector */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-8">
          <div className="flex items-center gap-3">
            <Star size={18} className="text-white/40" strokeWidth={1.5} />
            <p className="text-white text-sm leading-snug">
              Choisissez le restaurant<br />que vous gérez
            </p>
          </div>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <ChevronDown size={16} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-base">N°Siret</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-base">Kbis</label>
            <label className="w-full bg-[#D9D9D9] rounded px-4 py-4 flex items-center cursor-pointer hover:bg-[#CECECE] transition-colors">
              <Upload size={18} className="text-michelin-black/50" strokeWidth={1.5} />
              <input type="file" accept=".pdf,image/*" className="hidden" />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-base">Facture pro (edf, etc)</label>
            <label className="w-full bg-[#D9D9D9] rounded px-4 py-4 flex items-center cursor-pointer hover:bg-[#CECECE] transition-colors">
              <Upload size={18} className="text-michelin-black/50" strokeWidth={1.5} />
              <input type="file" accept=".pdf,image/*" className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded mt-4 hover:opacity-90 transition-opacity"
          >
            Envoyer les documents
          </button>

          <p className="text-center text-white/50 text-sm">
            Pas encore de compte&nbsp;?{' '}
            <Link href="/login/register" className="text-white hover:opacity-80 transition-opacity">
              Inscrivez-vous
            </Link>
          </p>

        </form>
      </div>
    </div>
  )
}
