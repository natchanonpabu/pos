'use server'

import { supabase } from '@/lib/supabase'
import type { OrderItem } from '@/types/order'

type CreateCustomerOrderInput = {
  tableId: string
  items: OrderItem[]
  discount?: number
}

export async function createCustomerOrder(input: CreateCustomerOrderInput) {
  const { tableId, items, discount = 0 } = input

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - discount

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ table_id: tableId, source: 'customer', subtotal, discount, total })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  const orderItems = items.map((item) => ({
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
