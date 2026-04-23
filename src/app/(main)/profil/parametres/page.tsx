'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Eye, EyeOff, User, Lock, Bell, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase/client'

type Toast = { message: string; type: 'success' | 'error' }

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
      style={{ background: checked ? '#ba0b2f' : 'rgba(255,255,255,0.15)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-1 mb-2">
      <Icon size={13} className="text-white/40" strokeWidth={1.5} />
      <p className="text-white/40 text-[11px] tracking-[1.8px] uppercase">{title}</p>
    </div>
  )
}

export default function ParametresPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [newPwd, setNewPwd] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const [notifNewRestaurants, setNotifNewRestaurants] = useState(true)
  const [notifRecommandations, setNotifRecommandations] = useState(true)
  const [notifActualites, setNotifActualites] = useState(false)

  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    setFullName(profile?.full_name ?? user?.user_metadata?.full_name ?? '')
    try {
      const stored = localStorage.getItem('notif_prefs')
      if (stored) {
        const prefs = JSON.parse(stored) as Record<string, boolean>
        setNotifNewRestaurants(prefs.newRestaurants ?? true)
        setNotifRecommandations(prefs.recommandations ?? true)
        setNotifActualites(prefs.actualites ?? false)
      }
    } catch {}
  }, [profile, user])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSaveName() {
    if (!fullName.trim() || !user) return
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)
    setSavingName(false)
    if (error) {
      showToast('Erreur lors de la sauvegarde', 'error')
    } else {
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
      showToast('Nom mis à jour', 'success')
    }
  }

  async function handleChangePassword() {
    if (newPwd.length < 8) {
      showToast('8 caractères minimum', 'error')
      return
    }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      setNewPwd('')
      showToast('Mot de passe mis à jour', 'success')
    }
  }

  function handleNotifChange(key: string, value: boolean) {
    const next = {
      newRestaurants: notifNewRestaurants,
      recommandations: notifRecommandations,
      actualites: notifActualites,
      [key]: value,
    }
    if (key === 'newRestaurants') setNotifNewRestaurants(value)
    if (key === 'recommandations') setNotifRecommandations(value)
    if (key === 'actualites') setNotifActualites(value)
    localStorage.setItem('notif_prefs', JSON.stringify(next))
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'radial-gradient(ellipse at 30% 0%, #5C0A0A 0%, #1C0907 40%, #110503 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 transition-colors active:bg-white/20"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-[18px]">Paramètres</h1>
      </div>

      {/* Email pill */}
      {user?.email && (
        <div className="mx-4 mb-6 flex items-center justify-center">
          <span className="text-white/40 text-[12px] tracking-wide">{user.email}</span>
        </div>
      )}

      <div className="px-4 flex flex-col gap-6">

        {/* Compte */}
        <div>
          <SectionHeader icon={User} title="Mon compte" />
          <div className="bg-white/8 rounded-[16px] overflow-hidden divide-y divide-white/8" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-4 flex flex-col gap-2">
              <label className="text-white/40 text-[11px] tracking-[0.5px]">Nom complet</label>
              <div className="flex gap-2">
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 bg-white/10 rounded-[10px] px-3 py-2.5 text-[14px] text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#ba0b2f]"
                  placeholder="Votre nom"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !fullName.trim()}
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 active:scale-95"
                  style={{ background: nameSaved ? '#22c55e' : '#ba0b2f' }}
                >
                  <Check size={15} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div>
          <SectionHeader icon={Lock} title="Sécurité" />
          <div className="rounded-[16px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-4 flex flex-col gap-3">
              <label className="text-white/40 text-[11px] tracking-[0.5px]">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  className="w-full bg-white/10 rounded-[10px] px-3 py-2.5 pr-10 text-[14px] text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#ba0b2f]"
                  placeholder="8 caractères minimum"
                />
                <button
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={savingPwd || newPwd.length < 8}
                className="w-full h-[44px] rounded-[10px] text-white text-[14px] font-medium flex items-center justify-center disabled:opacity-30 transition-all active:scale-[0.98]"
                style={{ background: '#ba0b2f' }}
              >
                {savingPwd ? 'Mise à jour…' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <SectionHeader icon={Bell} title="Notifications" />
          <div className="rounded-[16px] overflow-hidden divide-y" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Nouveaux restaurants', key: 'newRestaurants', value: notifNewRestaurants },
              { label: 'Recommandations pour moi', key: 'recommandations', value: notifRecommandations },
              { label: 'Actualités Michelin', key: 'actualites', value: notifActualites },
            ].map(({ label, key, value }) => (
              <div key={key} className="flex items-center justify-between px-4 py-4 gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-white text-[14px] font-medium">{label}</span>
                <Switch checked={value} onChange={v => handleNotifChange(key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger */}
        <div>
          <SectionHeader icon={Trash2} title="Zone de danger" />
          <div className="rounded-[16px] overflow-hidden" style={{ background: 'rgba(186,11,47,0.12)' }}>
            <button
              onClick={() => showToast('Contactez le support pour supprimer votre compte', 'error')}
              className="w-full px-4 py-4 text-left text-[#f87171] text-[14px] font-medium active:opacity-70 transition-opacity"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-28 left-4 right-4 rounded-[12px] px-4 py-3.5 text-white text-[13px] font-medium text-center shadow-xl"
          style={{ background: toast.type === 'success' ? '#22c55e' : '#ba0b2f' }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
