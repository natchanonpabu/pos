import type { User, UserRole } from '@/types/user'

export type UserRoleBadgeProps = {
  role: UserRole
}

export type UserStatusBadgeProps = {
  isActive: boolean
}

export type UserListItemProps = {
  user: User
  onEdit: (user: User) => void
}

export type UserListProps = {
  users: User[]
}

export type UserFormDialogProps = {
  mode: 'create' | 'edit'
  user?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export type UsersTemplateProps = {
  users: User[]
}
