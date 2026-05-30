'use client'

import { useEffect } from 'react'
import { Store, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-4">
      <Card className="w-full max-w-sm border-0 bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm dark:bg-card/95">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-300 dark:shadow-violet-900/40">
            <Store className="h-8 w-8 text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Chompoo POS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">เกิดข้อผิดพลาด</p>
          </div>

          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/30">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              เกิดข้อผิดพลาดในการโหลดหน้านี้
            </p>
          </div>

          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 dark:shadow-violet-900/30"
          >
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </Card>
    </div>
  )
}
