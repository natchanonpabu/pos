'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PosError({
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
    <div className="flex h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-foreground">
          เกิดข้อผิดพลาด
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          เกิดข้อผิดพลาดในการโหลดหน้านี้ กรุณาลองใหม่อีกครั้ง
        </p>

        <Button
          onClick={reset}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 dark:shadow-violet-900/30"
        >
          ลองใหม่อีกครั้ง
        </Button>
      </div>
    </div>
  )
}
