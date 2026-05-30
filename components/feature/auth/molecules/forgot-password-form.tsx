'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { requestPasswordReset } from '@/actions/auth'

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await requestPasswordReset(formData)

      if (!result.success) {
        setError(result.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }

      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className={cn('flex flex-col gap-5', className)}>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/30">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว!
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
            กรุณาตรวจสอบอีเมลของคุณ
          </p>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
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
        <p className="text-xs text-muted-foreground">
          เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณ
        </p>
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
            กำลังส่ง...
          </>
        ) : (
          'ส่งลิงก์รีเซ็ตรหัสผ่าน'
        )}
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าเข้าสู่ระบบ
      </Link>
    </form>
  )
}
