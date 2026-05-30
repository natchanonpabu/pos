'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useIncomingOrders } from '@/hooks/useIncomingOrders'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { Bell, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { IncomingOrderQueue } from '../organisms'
import { PosWorkspace } from '../organisms/pos-workspace'

type PosTerminalTemplateProps = {
  products: Product[]
}

export function PosTerminalTemplate({ products }: PosTerminalTemplateProps) {
  const orders = useIncomingOrders()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold lg:text-xl">ขายสินค้า</h1>
            <p className="hidden text-xs text-muted-foreground lg:block">เลือกสินค้าแล้วชำระเงิน</p>
          </div>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  'relative min-h-11 gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
                  orders.length > 0 && 'animate-pulse border-orange-400',
                )}
              />
            }
          >
            <Bell className="h-4 w-4" />
            ออเดอร์ลูกค้า
            {orders.length > 0 && (
              <Badge className="ml-1 bg-orange-500 text-white hover:bg-orange-600">{orders.length}</Badge>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[450px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                ออเดอร์จากลูกค้า
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <IncomingOrderQueue />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-hidden">
        <PosWorkspace products={products} />
      </main>
    </div>
  )
}
