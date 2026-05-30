import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Payment } from '@/types/order'

type PaymentRow = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    method: row.method,
    amount: row.amount,
    change: row.change,
    paidAt: new Date(row.paid_at),
  }
}

export const paymentService = {
  async create(
    orderId: string,
    method: Payment['method'],
    amount: number,
    change: number
  ): Promise<Payment> {
    const payload: PaymentInsert = {
      order_id: orderId,
      method,
      amount,
      change,
    }

    const { data, error } = await supabase
      .from('payments')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Update order status to 'paid'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid' as const })
      .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    return toPayment(data)
  },

  async getByOrderId(orderId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error) return null
    return toPayment(data)
  },
}
