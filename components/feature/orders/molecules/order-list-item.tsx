import Link from 'next/link'
import { OrderStatusBadge } from '../atoms'
import type { OrderListItemProps } from '../types'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  })
}

export function OrderListItem({ order }: OrderListItemProps) {
  const idSnippet = order.id.slice(0, 8)

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium">#{idSnippet}</p>
          <p className="text-sm text-muted-foreground">
            {order.tableId ? `โต๊ะ ${order.tableId}` : 'ไม่ระบุโต๊ะ'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            {order.total.toLocaleString('th-TH')} ฿
          </span>
          <OrderStatusBadge status={order.status} />
          <span className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)} {formatTime(order.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
