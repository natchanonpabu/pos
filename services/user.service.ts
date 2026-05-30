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

export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(toUser)
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return toUser(data)
  },

  async create(input: {
    email: string
    fullName: string
    role: UserRole
    password: string
  }): Promise<{ user: User | null; error: string | null }> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    })

    if (authError || !authData.user) {
      return { user: null, error: authError?.message ?? 'Failed to create user' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: input.fullName,
        role: input.role,
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (error || !data) {
      return { user: null, error: error?.message ?? 'Failed to update profile' }
    }

    return { user: toUser(data), error: null }
  },

  async update(
    id: string,
    data: Partial<{ fullName: string; role: UserRole; isActive: boolean }>
  ): Promise<{ user: User | null; error: string | null }> {
    const updateData: Database['public']['Tables']['profiles']['Update'] = {}

    if (data.fullName !== undefined) {
      updateData.full_name = data.fullName
    }
    if (data.role !== undefined) {
      updateData.role = data.role
    }
    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !updated) {
      return { user: null, error: error?.message ?? 'Failed to update user' }
    }

    return { user: toUser(updated), error: null }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('profiles').delete().eq('id', id)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },
}
