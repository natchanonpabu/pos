'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signIn(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, error: 'Email and password are required' }
  }

  if (!email.trim() || !password.trim()) {
    return { success: false, error: 'Email and password cannot be empty' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )

  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')

  if (typeof email !== 'string') {
    return { success: false, error: 'Email is required' }
  }

  if (!email.trim()) {
    return { success: false, error: 'Email cannot be empty' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function resetPassword(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return { success: false, error: 'All fields are required' }
  }

  if (!password.trim() || !confirmPassword.trim()) {
    return { success: false, error: 'Fields cannot be empty' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
