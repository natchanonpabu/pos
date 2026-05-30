import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UserRoleBadge, UserStatusBadge } from '../atoms'
import type { UserListItemProps } from '../types'

export function UserListItem({ user, onEdit }: UserListItemProps) {
  const initial = user.fullName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white',
          'bg-gradient-to-br from-violet-400 to-indigo-600'
        )}
      >
        {initial}
      </div>

      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge isActive={user.isActive} />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="min-h-[44px] min-w-[44px]"
        onClick={() => onEdit(user)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">แก้ไข</span>
      </Button>
    </div>
  )
}
