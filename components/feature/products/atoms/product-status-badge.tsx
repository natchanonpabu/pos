import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProductStatusBadgeProps } from '../types'

export function ProductStatusBadge({ isAvailable }: ProductStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'gap-1 border font-semibold',
        isAvailable
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
      )}
    >
      <span>{isAvailable ? '●' : '○'}</span>
      {isAvailable ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}
    </Badge>
  )
}
