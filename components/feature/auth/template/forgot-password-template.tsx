'use client'

import { Store } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ForgotPasswordForm } from '../molecules/forgot-password-form'

export function ForgotPasswordTemplate() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-4">
      <Card className="w-full max-w-sm border-0 bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm dark:bg-card/95">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-300 dark:shadow-violet-900/40">
            <Store className="h-8 w-8 text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ลืมรหัสผ่าน
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              รีเซ็ตรหัสผ่านของคุณ
            </p>
          </div>

          <ForgotPasswordForm className="w-full" />
        </div>
      </Card>
    </div>
  )
}
