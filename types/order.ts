export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled'

export type OrderSource = 'staff' | 'customer'

export type Order = {
  id: string
  tableId: string | null
  source: OrderSource
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: OrderStatus
  createdAt: Date
}

export type Payment = {
  id: string
  orderId: string
  method: 'cash' | 'qr' | 'card'
  amount: number
  change: number
  paidAt: Date
}
