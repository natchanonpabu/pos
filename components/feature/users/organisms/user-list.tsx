'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { UserListItem } from '../molecules'
import { UserFormDialog } from '../molecules'
import type { UserListProps } from '../types'
import type { User } from '@/types/user'

export function UserList({ users }: UserListProps) {
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(user: User) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setEditingUser(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาผู้ใช้..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] pl-9"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            ไม่พบผู้ใช้
          </p>
        ) : (
          filtered.map((user) => (
            <UserListItem key={user.id} user={user} onEdit={handleEdit} />
          ))
        )}
      </div>

      {editingUser && (
        <UserFormDialog
          mode="edit"
          user={editingUser}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
        />
      )}
    </div>
  )
}
