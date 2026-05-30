import type { Order, OrderStatus } from '@/types/order'

export type OrdersListProps = {
  orders: Order[]
}

export type OrderListItemProps = {
  order: Order
}

export type OrderStatusBadgeProps = {
  status: OrderStatus
}
