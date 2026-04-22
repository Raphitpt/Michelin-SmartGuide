'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = Database['public']['Enums']['user_role']

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
      setRole(data?.role ?? null)
    }

    // onAuthStateChange fires INITIAL_SESSION immediately with the current session
    // This replaces the getSession() call and handles all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setRole((s?.user?.app_metadata?.user_role as UserRole) ?? null)

      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setProfile(null)
        setRole(null)
      }

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const value = useMemo(
    () => ({ user, session, profile, role, loading }),
    [user, session, profile, role, loading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
