'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type IncomingOrder = {
  id: string
  table_id: string | null
  source: 'staff' | 'customer'
  total: number
  status: string
  created_at: string
}

export function useIncomingOrders() {
  const [orders, setOrders] = useState<IncomingOrder[]>([])

  useEffect(() => {
    // โหลด pending customer orders ที่มีอยู่แล้ว
    supabase
      .from('orders')
      .select('*')
      .eq('source', 'customer')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as IncomingOrder[])
      })

    // Subscribe real-time insertions
    const channel = supabase
      .channel('incoming-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: "source=eq.customer" },
        (payload) => {
          setOrders((prev) => [payload.new as IncomingOrder, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev
              .map((o) => (o.id === payload.new.id ? (payload.new as IncomingOrder) : o))
              .filter((o) => o.status === 'pending')
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return orders
}
