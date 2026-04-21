'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { useActionState } from 'react'
import { signInAction } from '@/lib/auth/actions'
import type { SignInState } from '@/lib/auth/schemas'

export default function ClientLoginPage() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, undefined)
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col justify-end px-6 pb-12"
      style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}
    >
      <form action={action} className="flex flex-col gap-6">

        {state?.message && (
          <p className="text-red-400 text-sm text-center bg-red-400/10 rounded px-4 py-3">
            {state.message}
          </p>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-white font-semibold text-base">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-michelin-black/50"
              strokeWidth={1.5}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full bg-[#D9D9D9] rounded pl-9 pr-4 py-4 text-sm text-michelin-black outline-none"
            />
          </div>
          {state?.errors?.email && (
            <p className="text-red-400 text-xs">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-white font-semibold text-base">Mot de passe</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full bg-[#D9D9D9] rounded px-4 pr-11 py-4 text-sm text-michelin-black outline-none"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-michelin-black/40 hover:text-michelin-black/70 transition-colors"
              aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {passwordVisible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
          {state?.errors?.password && (
            <p className="text-red-400 text-xs">{state.errors.password[0]}</p>
          )}
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
          disabled={pending}
          className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded hover:opacity-90 transition-opacity mt-2 disabled:opacity-60"
        >
          {pending ? 'Connexion…' : 'Se connecter'}
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
