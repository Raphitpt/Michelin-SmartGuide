'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Eye, EyeOff, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function FloatingInput({
  id,
  name,
  type = 'text',
  autoComplete,
  label,
  icon: Icon,
  error,
  defaultValue,
  rightSlot,
}: {
  id: string
  name: string
  type?: string
  autoComplete?: string
  label: string
  icon?: React.ElementType
  error?: string
  defaultValue?: string
  rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!defaultValue)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-white/70 text-xs font-medium tracking-wider uppercase">
        {label}
      </label>
      <div className={`relative flex items-center rounded-sm transition-all duration-200 border ${focused ? 'border-michelin-red/70 bg-white/5' : 'border-white/15 bg-white/5'}`}>
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
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); setHasValue(!!e.target.value) }}
          className={`w-full bg-transparent py-4 text-sm text-white placeholder-white/25 outline-none ${Icon ? 'pl-10' : 'pl-4'} ${rightSlot ? 'pr-11' : 'pr-4'}`}
          placeholder=" "
        />
        {rightSlot && (
          <div className="absolute right-3">{rightSlot}</div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

export default function ClientLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou mot de passe incorrect.')
      setPending(false)
      return
    }

    router.push('/')
    router.refresh()
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

      <div className="flex-1 flex flex-col justify-end px-6 pb-12 pt-8">
        {/* Title */}
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">Connexion</p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Bon retour<br />parmi nous
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {error}
            </div>
          )}

          <FloatingInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email"
            icon={Mail}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-white/70 text-xs font-medium tracking-wider uppercase">
              Mot de passe
            </label>
            <div className={`relative flex items-center rounded-sm border border-white/15 bg-white/5`}>
              <Lock size={15} strokeWidth={1.5} className="absolute left-3.5 text-white/30" />
              <input
                id="password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full bg-transparent py-4 pl-10 pr-11 text-sm text-white placeholder-white/25 outline-none focus:border-michelin-red/70"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
                aria-label={passwordVisible ? 'Masquer' : 'Afficher'}
              >
                {passwordVisible ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
              </button>
            </div>
            <Link href="/login/forgot" className="text-white/35 text-xs self-end mt-0.5 hover:text-white/60 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm mt-2 hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {pending ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="text-center text-white/35 text-sm">
            Pas encore de compte ?{' '}
            <Link href="/login/register" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">
              Inscrivez-vous
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
