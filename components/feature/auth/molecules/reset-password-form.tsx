'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { resetPassword } from '@/actions/auth'

export function ResetPasswordForm({ className }: { className?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await resetPassword(formData)

      if (!result.success) {
        setError(result.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    })
  }

  if (success) {
    return (
      <div className={cn('flex flex-col gap-5', className)}>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/30">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            รีเซ็ตรหัสผ่านสำเร็จ!
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
            กำลังนำคุณไปหน้าเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-5', className)}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">รหัสผ่านใหม่</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="min-h-[44px]"
          disabled={isPending}
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">อย่างน้อย 6 ตัวอักษร</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className="min-h-[44px]"
          disabled={isPending}
          minLength={6}
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
            กำลังรีเซ็ตรหัสผ่าน...
          </>
        ) : (
          'รีเซ็ตรหัสผ่าน'
        )}
      </Button>
    </form>
  )
}
