import { ClipboardList } from 'lucide-react'
import { OrderList } from '../organisms'
import type { Order } from '@/types/order'

type OrdersTemplateProps = {
  orders: Order[]
}

export function OrdersTemplate({ orders }: OrdersTemplateProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-200">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ออเดอร์</h1>
          <p className="text-sm text-muted-foreground">
            ประวัติออเดอร์ทั้งหมด ({orders.length} รายการ)
          </p>
        </div>
      </div>

      <OrderList orders={orders} />
    </div>
  )
}
