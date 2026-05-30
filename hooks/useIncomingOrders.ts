'use client'

import { useEffect, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { orderService, type OrderRow } from '@/services/order.service'

export type IncomingOrder = OrderRow

export function useIncomingOrders(): IncomingOrder[] {
  const [orders, setOrders] = useState<IncomingOrder[]>([])

  useEffect(() => {
    orderService.getPendingCustomerOrders().then(setOrders)

    const channel = supabase
      .channel('incoming-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: 'source=eq.customer' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          setOrders((prev: IncomingOrder[]) => [payload.new as IncomingOrder, ...prev])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const updated = payload.new as IncomingOrder
          setOrders((prev: IncomingOrder[]) =>
            prev
              .map((o: IncomingOrder) => (o.id === updated.id ? updated : o))
              .filter((o: IncomingOrder) => o.status === 'pending'),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return orders
}
