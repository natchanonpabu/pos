export type UserRole = 'admin' | 'staff' | 'manager'

export type User = {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
}
