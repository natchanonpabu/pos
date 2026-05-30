import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types/user'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  }
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { session: null, error: error.message }
    }

    return { session: data.session, error: null }
  },

  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return { user: null, error: sessionError?.message ?? 'No active session' }
    }

    const userId = sessionData.session.user.id

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return { user: null, error: error?.message ?? 'Profile not found' }
    }

    return { user: toUser(data), error: null }
  },
}
