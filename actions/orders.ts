'use server'

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Order, OrderItem } from '@/types/order'
import { orderService } from '@/services/order.service'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

type CreateCustomerOrderInput = {
  tableId: string
  items: OrderItem[]
  discount?: number
}

export async function createCustomerOrder(input: CreateCustomerOrderInput) {
  const { tableId, items, discount = 0 } = input

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - discount

  const orderPayload: OrderInsert = {
    table_id: tableId,
    source: 'customer',
    subtotal,
    discount,
    total,
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  const orderItems: OrderItemInsert[] = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) throw new Error(itemsError.message)

  return order
}

export async function confirmOrder(formData: FormData): Promise<void> {
  const orderId = formData.get('orderId') as string
  await orderService.updateStatus(orderId, 'confirmed')
}

export async function cancelOrder(formData: FormData): Promise<void> {
  const orderId = formData.get('orderId') as string
  await orderService.updateStatus(orderId, 'cancelled')
}

export async function processPayment(formData: FormData): Promise<void> {
  const orderId = formData.get('orderId') as string
  await orderService.updateStatus(orderId, 'paid')
}
