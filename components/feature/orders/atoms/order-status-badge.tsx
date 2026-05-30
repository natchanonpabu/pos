import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatusBadgeProps } from '../types'

const statusConfig: Record<string, { label: string; icon: string; className: string }> = {
  pending: {
    label: 'รอดำเนินการ',
    icon: '⏳',
    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  confirmed: {
    label: 'ยืนยันแล้ว',
    icon: '✓',
    className: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  },
  paid: {
    label: 'ชำระแล้ว',
    icon: '💰',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  cancelled: {
    label: 'ยกเลิก',
    icon: '✕',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge className={cn('gap-1 border font-semibold', config.className)}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  )
}
