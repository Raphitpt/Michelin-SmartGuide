'use client'

import Link from 'next/link'
import { useActionState, useRef, useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { submitClaimAction } from '@/lib/auth/actions'
import type { ClaimState } from '@/lib/auth/schemas'

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
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-white font-semibold text-base">{label}</label>
      <label
        htmlFor={name}
        className="w-full bg-[#D9D9D9] rounded px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-[#CECECE] transition-colors"
      >
        {fileName ? (
          <CheckCircle size={18} className="text-green-600 shrink-0" strokeWidth={1.5} />
        ) : (
          <Upload size={18} className="text-michelin-black/50 shrink-0" strokeWidth={1.5} />
        )}
        <span className="text-sm text-michelin-black/70 truncate">
          {fileName ?? 'Choisir un fichier…'}
        </span>
        <input
          ref={inputRef}
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
        style={{ background: 'linear-gradient(to bottom, #110503, #1C0907)' }}
      >
        <CheckCircle size={56} className="text-green-400" strokeWidth={1.5} />
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Demande envoyée</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Votre demande de revendication est en cours d&apos;examen. Vous recevrez une réponse par email.
          </p>
        </div>
        <Link
          href="/"
          className="w-full bg-michelin-red text-white text-sm font-medium text-center py-4 rounded hover:opacity-90 transition-opacity"
        >
          Accéder à l&apos;application
        </Link>
      </div>
    )
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
        <form action={action} className="flex flex-col gap-5">

          {state?.message && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 rounded px-4 py-3">
              {state.message}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="restaurant_name" className="text-white font-semibold text-base">
              Nom du restaurant
            </label>
            <input
              id="restaurant_name"
              name="restaurant_name"
              type="text"
              placeholder="Ex : Le Grand Véfour"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.restaurant_name && (
              <p className="text-red-400 text-xs">{state.errors.restaurant_name[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="siret" className="text-white font-semibold text-base">N° SIRET</label>
            <input
              id="siret"
              name="siret"
              type="text"
              inputMode="numeric"
              maxLength={14}
              placeholder="14 chiffres"
              className="w-full bg-[#D9D9D9] rounded px-4 py-4 text-sm text-michelin-black outline-none"
            />
            {state?.errors?.siret && (
              <p className="text-red-400 text-xs">{state.errors.siret[0]}</p>
            )}
          </div>

          <FileField name="kbis" label="Kbis" error={state?.errors?.kbis} />
          <FileField name="facture" label="Facture pro (EDF, etc.)" error={state?.errors?.facture} />

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded mt-4 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? 'Envoi en cours…' : 'Envoyer les documents'}
          </button>

        </form>
      </div>
    </div>
  )
}
