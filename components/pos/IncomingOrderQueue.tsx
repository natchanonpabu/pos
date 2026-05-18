'use client'

import { useIncomingOrders } from '@/hooks/useIncomingOrders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'

export function IncomingOrderQueue() {
  const orders = useIncomingOrders()

  async function confirmOrder(orderId: string) {
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
  }

  async function cancelOrder(orderId: string) {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
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
        <Badge variant="destructive">{orders.length}</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    โต๊ะ {order.table_id ? `#${order.table_id.slice(-4)}` : '—'}
                  </span>
                  <span className="text-sm font-bold">฿{order.total.toFixed(0)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => confirmOrder(order.id)}
                  >
                    รับออเดอร์
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelOrder(order.id)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
