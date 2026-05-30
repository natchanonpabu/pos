import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@/types/user'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as 'admin' | 'staff' | 'manager',
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  }
}

export async function getServerSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !data) {
    return null
  }

  return toUser(data)
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireRole(
  allowedRoles: Array<'admin' | 'staff' | 'manager'>
): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }

  return user
}
