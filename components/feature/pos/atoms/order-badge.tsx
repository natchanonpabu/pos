import { Badge } from '@/components/ui/badge'

type OrderBadgeProps = {
  count: number
}

export function OrderBadge({ count }: OrderBadgeProps) {
  return <Badge variant="destructive">{count}</Badge>
}
