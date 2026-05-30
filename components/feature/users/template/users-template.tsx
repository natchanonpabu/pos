'use client'

import { useState } from 'react'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UserList } from '../organisms'
import { UserFormDialog } from '../molecules'
import type { UsersTemplateProps } from '../types'

export function UsersTemplate({ users }: UsersTemplateProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md shadow-pink-200 dark:shadow-pink-900/30">
            <UsersIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">จัดการผู้ใช้</h1>
            <p className="text-sm text-muted-foreground">
              ผู้ใช้ทั้งหมด ({users.length} คน)
            </p>
          </div>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className={cn(
            'min-h-[44px] gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 dark:shadow-violet-900/30'
          )}
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      <UserList users={users} />

      <UserFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
