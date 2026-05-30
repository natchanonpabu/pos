import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserRoleBadgeProps } from '../types'

const roleConfig = {
  admin: {
    label: 'ผู้ดูแล',
    className:
      'border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 dark:border-purple-800 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400',
  },
  manager: {
    label: 'ผู้จัดการ',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  staff: {
    label: 'พนักงาน',
    className:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400',
  },
} as const

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = roleConfig[role]

  return (
    <Badge className={cn('border font-semibold', config.className)}>
      {config.label}
    </Badge>
  )
}
