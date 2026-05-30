'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OrderListItem } from '../molecules'
import type { Order, OrderStatus } from '@/types/order'
import type { OrdersListProps } from '../types'

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'paid', label: 'ชำระแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

export function OrderList({ orders }: OrdersListProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((order) => order.status === activeTab as OrderStatus)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {statusTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-h-[44px]"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-4">
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              ไม่มีออเดอร์
            </p>
          ) : (
            filtered.map((order) => (
              <OrderListItem key={order.id} order={order} />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
