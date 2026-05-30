'use server'

import { supabase } from '@/lib/supabase'
import { orderService } from '@/services/order.service'
import { paymentService } from '@/services/payment.service'
import type { Database } from '@/types/database'
import type { OrderItem, Payment } from '@/types/order'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export async function processPayment(
  orderId: string,
  method: Payment['method'],
  amountReceived: number,
): Promise<Payment> {
  const order = await orderService.getById(orderId)
  if (!order) throw new Error(`Order not found: ${orderId}`)

  if (order.status === 'paid') throw new Error('Order is already paid')
  if (order.status === 'cancelled') throw new Error('Cannot pay a cancelled order')

  const change = amountReceived - order.total
  if (change < 0) throw new Error('Insufficient payment amount')

  return paymentService.create(orderId, method, amountReceived, change)
}

type CreateStaffOrderAndPayInput = {
  items: OrderItem[]
  discount: number
  method: 'cash' | 'qr' | 'card'
  amountReceived: number
}

type CreateStaffOrderAndPayResult = {
  success: boolean
  orderId?: string
  change?: number
  error?: string
}

export async function createStaffOrderAndPay(
  input: CreateStaffOrderAndPayInput,
): Promise<CreateStaffOrderAndPayResult> {
  const { items, discount, method, amountReceived } = input

  if (items.length === 0) {
    return { success: false, error: 'ไม่มีสินค้าในตะกร้า' }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - discount)

  if (amountReceived < total) {
    return { success: false, error: 'จำนวนเงินไม่เพียงพอ' }
  }

  const change = amountReceived - total

  // Create order
  const orderPayload: OrderInsert = {
    source: 'staff',
    subtotal,
    discount,
    total,
    status: 'paid',
  }

  const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select().single()

  if (orderError) {
    return { success: false, error: orderError.message }
  }

  // Create order items
  const orderItems: OrderItemInsert[] = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  // Create payment record
  const payment = await paymentService.create(order.id, method, amountReceived, change)

  if (!payment) {
    return { success: false, error: 'ไม่สามารถบันทึกการชำระเงินได้' }
  }

  return { success: true, orderId: order.id, change }
}
