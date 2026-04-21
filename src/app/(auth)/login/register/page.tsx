'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

export default function RegisterPage() {
  const router = useRouter()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-white font-semibold text-base">Nom</label>
            <input
              id="nom"
              type="text"
              autoComplete="family-name"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="prenom" className="text-white font-semibold text-base">Prénom</label>
            <input
              id="prenom"
              type="text"
              autoComplete="given-name"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dob" className="text-white font-semibold text-base">Date de naissance</label>
            <input
              id="dob"
              type="date"
              autoComplete="bday"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white font-semibold text-base">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="text-white font-semibold text-base">Confirmer mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded mt-2 hover:opacity-90 transition-opacity"
          >
            S&apos;inscrire
          </button>

          <p className="text-center text-white/50 text-sm">
            Déjà un compte&nbsp;?{' '}
            <Link href="/login/client" className="text-white hover:opacity-80 transition-opacity">
              Se connecter
            </Link>
          </p>

        </form>
      </div>
    </div>
  )
}
