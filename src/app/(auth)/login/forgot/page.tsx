'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useActionState } from 'react'
import { forgotPasswordAction } from '@/lib/auth/actions'
import type { ForgotPasswordState } from '@/lib/auth/schemas'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    undefined,
  )
  const [focused, setFocused] = useState(false)

  if (state?.success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)' }}
      >
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Mail size={28} className="text-white/60" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Email envoyé</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.
          </p>
        </div>
        <Link
          href="/login/client"
          className="text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          ← Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)' }}
    >
      {/* Header */}
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center shrink-0">
        <Link href="/login/client" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-end px-6 pb-12 pt-8">
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">Sécurité</p>
          <h1 className="text-white font-bold text-2xl leading-snug mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-white/40 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-5">
          {state?.message && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {state.message}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-white/70 text-xs font-medium tracking-wider uppercase">
              Email
            </label>
            <div className={`relative flex items-center rounded-sm border transition-all duration-200 ${focused ? 'border-michelin-red/70 bg-white/5' : 'border-white/15 bg-white/5'}`}>
              <Mail
                size={15}
                strokeWidth={1.5}
                className={`absolute left-3.5 transition-colors duration-200 ${focused ? 'text-michelin-red/80' : 'text-white/30'}`}
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full bg-transparent py-4 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none"
              />
            </div>
            {state?.errors?.email && (
              <p className="text-red-400 text-xs">{state.errors.email[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {pending ? 'Envoi…' : 'Envoyer le lien'}
          </button>

          <Link
            href="/login/client"
            className="text-center text-white/35 text-sm hover:text-white/60 transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  )
}
