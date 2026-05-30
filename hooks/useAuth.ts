'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchProfile(authUser: SupabaseUser) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!mounted) return

      if (error || !data) {
        setUser(null)
      } else {
        setUser({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          avatarUrl: data.avatar_url,
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
        })
      }

      setLoading(false)
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    signOut: handleSignOut,
  }
}
