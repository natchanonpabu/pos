import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Order, OrderItem, OrderStatus, OrderSource } from '@/types/order'

export type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']

type OrderWithItemsRow = OrderRow & {
  order_items: OrderItemRow[]
}

export type SalesReport = {
  totalOrders: number
  totalRevenue: number
  totalDiscount: number
  averageOrderValue: number
  orders: Order[]
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
  }
}

function toOrder(row: OrderRow, items: OrderItemRow[] = []): Order {
  return {
    id: row.id,
    tableId: row.table_id,
    source: row.source,
    items: items.map(toOrderItem),
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    status: row.status,
    createdAt: new Date(row.created_at),
  }
}

export const orderService = {
  async getPendingCustomerOrders(): Promise<OrderRow[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('source', 'customer')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw new Error(error.message)
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderWithItemsRow[]).map((row) => toOrder(row, row.order_items))
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (error) return null
    const row = data as OrderWithItemsRow
    return toOrder(row, row.order_items)
  },

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderWithItemsRow[]).map((row) => toOrder(row, row.order_items))
  },

  async getTodayOrders(): Promise<Order[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfDay = today.toISOString()

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', startOfDay)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderWithItemsRow[]).map((row) => toOrder(row, row.order_items))
  },

  async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReport> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const orders = (data as OrderWithItemsRow[]).map((row) => toOrder(row, row.order_items))
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalDiscount = orders.reduce((sum, o) => sum + o.discount, 0)

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalDiscount,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      orders,
    }
  },
}
