'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
