'use client'

import { useState, useTransition } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCustomerCartStore } from '@/store/customer-cart.store'
import { createCustomerOrder } from '@/actions/orders'
import type { OrderItem } from '@/types/order'

type CartDrawerProps = {
  tableId: string
}

export function CartDrawer({ tableId }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clear, total } = useCustomerCartStore()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [ordered, setOrdered] = useState(false)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  function handleOrder() {
    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }))

    startTransition(async () => {
      await createCustomerOrder({ tableId, items: orderItems })
      clear()
      setOrdered(true)
      setTimeout(() => {
        setOrdered(false)
        setOpen(false)
      }, 2000)
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="fixed bottom-4 right-4 h-14 rounded-full px-6 shadow-lg" size="lg" />
        }
      >
        ดูตะกร้า {itemCount > 0 && `(${itemCount})`}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>ตะกร้าของฉัน</SheetTitle>
        </SheetHeader>

        {ordered ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold">สั่งอาหารแล้ว!</p>
            <p className="text-muted-foreground text-sm">กรุณารอสักครู่</p>
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">ยังไม่มีรายการ</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ฿{(item.product.price * item.quantity).toFixed(0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between font-semibold">
              <span>รวม</span>
              <span>฿{total().toFixed(0)}</span>
            </div>

            <Button
              className="mt-2 w-full"
              size="lg"
              onClick={handleOrder}
              disabled={isPending}
            >
              {isPending ? 'กำลังส่งออเดอร์...' : 'ยืนยันสั่งอาหาร'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
