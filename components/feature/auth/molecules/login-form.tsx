'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signIn } from '@/actions/auth'
import type { LoginFormProps } from '../types'

export function LoginForm({ className }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await signIn(formData)

      if (!result.success) {
        setError(result.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }

      window.location.href = next
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-5', className)}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          className="min-h-[44px]"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="min-h-[44px]"
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          'min-h-[44px] w-full bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 dark:shadow-violet-900/30'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </Button>
    </form>
  )
}
