'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'

export default function ClientLoginPage() {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/')
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-end px-6 pb-12"
      style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-semibold text-base">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-michelin-black/50"
              strokeWidth={1.5}
            />
            <input
              type="email"
              autoComplete="email"
              className="w-full bg-[#D9D9D9] rounded pl-9 pr-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-2">
          <label className="text-white font-semibold text-base">Mot de passe</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
          />
          <Link
            href="/login/forgot"
            className="text-white/50 text-xs self-end hover:text-white/80 transition-colors"
          >
            Mot de passe oublié&nbsp;?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded hover:opacity-90 transition-opacity mt-2"
        >
          Se connecter
        </button>

        {/* Register */}
        <p className="text-center text-white/50 text-sm">
          Pas encore de compte&nbsp;?{' '}
          <Link href="/login/register" className="text-white hover:opacity-80 transition-opacity">
            Inscrivez-vous
          </Link>
        </p>

      </form>
    </div>
  )
}
