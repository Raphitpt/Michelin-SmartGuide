'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUpRestaurantAction } from '@/lib/auth/actions'
import type { SignUpRestaurantState } from '@/lib/auth/schemas'

export default function RestaurantLoginPage() {
  const [state, action, pending] = useActionState<SignUpRestaurantState, FormData>(
    signUpRestaurantAction,
    undefined,
  )

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
        <form action={action} className="flex flex-col gap-5">

          {state?.message && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 rounded px-4 py-3">
              {state.message}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-white font-semibold text-base">Nom du responsable</label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="name"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.nom && <p className="text-red-400 text-xs">{state.errors.nom[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="job_title" className="text-white font-semibold text-base">Rôle du responsable</label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.job_title && (
              <p className="text-red-400 text-xs">{state.errors.job_title[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white font-semibold text-base">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.email && <p className="text-red-400 text-xs">{state.errors.email[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white font-semibold text-base">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.password && (
              <ul className="text-red-400 text-xs list-disc list-inside">
                {state.errors.password.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="text-white font-semibold text-base">Confirmer mot de passe</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.confirm_password && (
              <p className="text-red-400 text-xs">{state.errors.confirm_password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded mt-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? 'Création du compte…' : 'Revendiquer ce restaurant'}
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
