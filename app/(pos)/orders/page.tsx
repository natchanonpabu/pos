import { orderService } from '@/services/order.service'
import { OrdersTemplate } from '@/components/feature/orders/template/orders-template'

export default async function OrdersPage() {
  const orders = await orderService.getAll()

  return <OrdersTemplate orders={orders} />
}
