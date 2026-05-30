'use client'

import { useIncomingOrders } from '@/hooks/useIncomingOrders'
import { orderService } from '@/services/order.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OrderBadge } from '../atoms'
import { OrderCard } from '../molecules'

export function IncomingOrderQueue() {
  const orders = useIncomingOrders()

  async function confirmOrder(orderId: string) {
    await orderService.updateStatus(orderId, 'confirmed')
  }

  async function cancelOrder(orderId: string) {
    await orderService.updateStatus(orderId, 'cancelled')
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ออเดอร์จากลูกค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ยังไม่มีออเดอร์ใหม่</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">ออเดอร์จากลูกค้า</CardTitle>
        <OrderBadge count={orders.length} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={confirmOrder}
                onCancel={cancelOrder}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
