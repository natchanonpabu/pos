'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createUser, updateUser } from '@/actions/users'
import type { UserFormDialogProps } from '../types'
import type { UserRole } from '@/types/user'

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'ผู้ดูแล' },
  { value: 'manager', label: 'ผู้จัดการ' },
  { value: 'staff', label: 'พนักงาน' },
]

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserFormDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      let result: { success: boolean; error?: string }

      if (mode === 'create') {
        result = await createUser(formData)
      } else {
        result = await updateUser(user!.id, formData)
      }

      if (!result.success) {
        setError(result.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }

      onOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขผู้ใช้'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={user?.fullName ?? ''}
              placeholder="ชื่อ นามสกุล"
              className="min-h-[44px]"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={user?.email ?? ''}
              placeholder="name@example.com"
              className="min-h-[44px]"
              disabled={isPending || mode === 'edit'}
            />
          </div>

          {mode === 'create' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="min-h-[44px]"
                disabled={isPending}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">ตำแหน่ง</Label>
            <select
              id="role"
              name="role"
              required
              defaultValue={user?.role ?? 'staff'}
              disabled={isPending}
              className={cn(
                'flex min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="min-h-[44px]"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                'min-h-[44px] bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 dark:shadow-violet-900/30'
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : mode === 'create' ? (
                'เพิ่มผู้ใช้'
              ) : (
                'บันทึก'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
