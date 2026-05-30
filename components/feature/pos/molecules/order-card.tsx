'use client'

import { Button } from '@/components/ui/button'
import { TableLabel, OrderPrice } from '../atoms'
import type { IncomingOrder } from '../types'

type OrderCardProps = {
  order: IncomingOrder
  onConfirm: (orderId: string) => void
  onCancel: (orderId: string) => void
}

export function OrderCard({ order, onConfirm, onCancel }: OrderCardProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <TableLabel tableId={order.table_id} />
        <OrderPrice amount={order.total} />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onConfirm(order.id)}
        >
          รับออเดอร์
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel(order.id)}
        >
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}
