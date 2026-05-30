import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { orderService } from '@/services/order.service'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { OrderStatusBadge } from '@/components/feature/orders/atoms'
import { confirmOrder, processPayment } from '@/actions/orders'
import { cn } from '@/lib/utils'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await orderService.getById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'min-h-[44px] min-w-[44px]')}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">กลับ</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">ออเดอร์ #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            {order.createdAt.toLocaleString('th-TH')}
            {order.tableId && ` — โต๊ะ ${order.tableId}`}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium">รายการสินค้า</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.price.toLocaleString('th-TH')} ฿ x {item.quantity}
                </p>
              </div>
              <span className="font-semibold">
                {(item.price * item.quantity).toLocaleString('th-TH')} ฿
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ยอดรวม</span>
            <span>{order.subtotal.toLocaleString('th-TH')} ฿</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ส่วนลด</span>
              <span className="text-red-600">-{order.discount.toLocaleString('th-TH')} ฿</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>ยอดสุทธิ</span>
            <span>{order.total.toLocaleString('th-TH')} ฿</span>
          </div>
        </div>
      </Card>

      {order.status === 'pending' && (
        <div className="flex gap-3">
          <form action={confirmOrder}>
            <input type="hidden" name="orderId" value={order.id} />
            <Button type="submit" className="min-h-[44px]">
              ยืนยันออเดอร์
            </Button>
          </form>
        </div>
      )}

      {order.status === 'confirmed' && (
        <div className="flex gap-3">
          <form action={processPayment}>
            <input type="hidden" name="orderId" value={order.id} />
            <Button type="submit" className="min-h-[44px]">
              รับชำระเงิน
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
