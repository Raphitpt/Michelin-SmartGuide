'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useActionState } from 'react'
import { Upload, CheckCircle, Building2, Hash } from 'lucide-react'
import { submitClaimAction } from '@/lib/auth/actions'
import type { ClaimState } from '@/lib/auth/schemas'

function TextField({
  id,
  name,
  type = 'text',
  inputMode,
  maxLength,
  placeholder,
  label,
  icon: Icon,
  error,
}: {
  id: string
  name: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  placeholder?: string
  label: string
  icon?: React.ElementType
  error?: string
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-white/70 text-xs font-medium tracking-wider uppercase">
        {label}
      </label>
      <div className={`relative flex items-center rounded-sm border transition-all duration-200 ${focused ? 'border-michelin-red/70 bg-white/5' : 'border-white/15 bg-white/5'}`}>
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            className={`absolute left-3.5 shrink-0 transition-colors duration-200 ${focused ? 'text-michelin-red/80' : 'text-white/30'}`}
          />
        )}
        <input
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent py-4 text-sm text-white placeholder-white/25 outline-none ${Icon ? 'pl-10' : 'pl-4'} pr-4`}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function FileField({
  name,
  label,
  error,
}: {
  name: string
  label: string
  error?: string[]
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-white/70 text-xs font-medium tracking-wider uppercase">
        {label}
      </label>
      <label
        htmlFor={name}
        className={`w-full rounded-sm border px-4 py-4 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
          fileName
            ? 'border-green-500/40 bg-green-500/5'
            : 'border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]'
        }`}
      >
        {fileName ? (
          <CheckCircle size={15} className="text-green-400 shrink-0" strokeWidth={1.5} />
        ) : (
          <Upload size={15} className="text-white/30 shrink-0" strokeWidth={1.5} />
        )}
        <span className={`text-sm truncate ${fileName ? 'text-green-300' : 'text-white/30'}`}>
          {fileName ?? 'Choisir un fichier…'}
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {error && <p className="text-red-400 text-xs">{error[0]}</p>}
    </div>
  )
}

export default function RestaurantVerifyPage() {
  const [state, action, pending] = useActionState<ClaimState, FormData>(submitClaimAction, undefined)

  if (state?.success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)' }}
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle size={28} className="text-green-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Demande envoyée</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Votre demande de revendication est en cours d&apos;examen. Vous recevrez une réponse par email.
          </p>
        </div>
        <Link
          href="/"
          className="w-full bg-michelin-red text-white text-sm font-semibold text-center py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150"
        >
          Accéder à l&apos;application
        </Link>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 40%, #110503 100%)' }}
    >
      {/* Header */}
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center shrink-0">
        <Link href="/login" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">Vérification</p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Justificatifs<br />du restaurant
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Ces documents permettent de vérifier votre établissement.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          {state?.message && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {state.message}
            </div>
          )}

          <TextField
            id="restaurant_name"
            name="restaurant_name"
            label="Nom du restaurant"
            icon={Building2}
            placeholder="Ex : Le Grand Véfour"
            error={state?.errors?.restaurant_name?.[0]}
          />

          <TextField
            id="siret"
            name="siret"
            label="N° SIRET"
            icon={Hash}
            inputMode="numeric"
            maxLength={14}
            placeholder="14 chiffres"
            error={state?.errors?.siret?.[0]}
          />

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">documents</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <FileField name="kbis" label="Kbis" error={state?.errors?.kbis} />
          <FileField name="facture" label="Facture pro (EDF, etc.)" error={state?.errors?.facture} />

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm mt-2 hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {pending ? 'Envoi en cours…' : 'Envoyer les documents'}
          </button>
        </form>
      </div>
    </div>
  )
}
