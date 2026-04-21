'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useActionState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { signUpAction } from '@/lib/auth/actions'
import type { SignUpState } from '@/lib/auth/schemas'

function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
}: {
  id: string
  name: string
  autoComplete: string
  placeholder?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-[#D9D9D9] rounded px-4 pr-11 py-4 text-sm text-michelin-black outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-michelin-black/40 hover:text-michelin-black/70 transition-colors"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
      </button>
    </div>
  )
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUpAction, undefined)
  const v = state?.values

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
            <label htmlFor="nom" className="text-white font-semibold text-base">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="family-name"
              defaultValue={v?.nom}
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.nom && <p className="text-red-400 text-xs">{state.errors.nom[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="prenom" className="text-white font-semibold text-base">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              autoComplete="given-name"
              defaultValue={v?.prenom}
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.prenom && <p className="text-red-400 text-xs">{state.errors.prenom[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="date_naissance" className="text-white font-semibold text-base">Date de naissance</label>
            <input
              id="date_naissance"
              name="date_naissance"
              type="date"
              autoComplete="bday"
              defaultValue={v?.date_naissance}
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.date_naissance && (
              <p className="text-red-400 text-xs">{state.errors.date_naissance[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white font-semibold text-base">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={v?.email}
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.email && <p className="text-red-400 text-xs">{state.errors.email[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white font-semibold text-base">Mot de passe</label>
            <PasswordInput id="password" name="password" autoComplete="new-password" />
            {state?.errors?.password && (
              <ul className="text-red-400 text-xs list-disc list-inside">
                {state.errors.password.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="text-white font-semibold text-base">Confirmer mot de passe</label>
            <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" />
            {state?.errors?.confirm_password && (
              <p className="text-red-400 text-xs">{state.errors.confirm_password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded mt-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? 'Création du compte…' : "S'inscrire"}
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
