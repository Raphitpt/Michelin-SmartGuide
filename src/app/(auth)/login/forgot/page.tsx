'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { useActionState } from 'react'
import { forgotPasswordAction } from '@/lib/auth/actions'
import type { ForgotPasswordState } from '@/lib/auth/schemas'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    undefined,
  )

  if (state?.success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}
      >
        <Mail size={48} className="text-white/60" strokeWidth={1.5} />
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Email envoyé</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.
          </p>
        </div>
        <Link
          href="/login/client"
          className="text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-end px-6 pb-12"
      style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}
    >
      <form action={action} className="flex flex-col gap-6">

        <div className="mb-2">
          <h1 className="text-white font-bold text-2xl mb-2">Mot de passe oublié</h1>
          <p className="text-white/50 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {state?.message && (
          <p className="text-red-400 text-sm text-center bg-red-400/10 rounded px-4 py-3">
            {state.message}
          </p>
        )}

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

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? 'Envoi…' : 'Envoyer le lien'}
        </button>

        <Link
          href="/login/client"
          className="text-center text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          Retour à la connexion
        </Link>

      </form>
    </div>
  )
}
