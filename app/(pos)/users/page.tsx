import { requireRole } from '@/lib/auth'
import { userService } from '@/services/user.service'
import { UsersTemplate } from '@/components/feature/users/template/users-template'

export default async function UsersPage() {
  // Only admin and manager can access this page
  await requireRole(['admin', 'manager'])

  const users = await userService.getAll()

  return <UsersTemplate users={users} />
}
