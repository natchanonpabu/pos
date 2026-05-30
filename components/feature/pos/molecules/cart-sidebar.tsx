'use client'

import { ShoppingCart, Trash2, CreditCard, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CartItemRow } from '../atoms/cart-item-row'
import { usePosCartStore } from '@/store/pos-cart.store'

type CartSidebarProps = {
  onCheckout: () => void
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const items = usePosCartStore((s) => s.items)
  const discount = usePosCartStore((s) => s.discount)
  const setDiscount = usePosCartStore((s) => s.setDiscount)
  const updateQuantity = usePosCartStore((s) => s.updateQuantity)
  const removeItem = usePosCartStore((s) => s.removeItem)
  const clear = usePosCartStore((s) => s.clear)
  const subtotal = usePosCartStore((s) => s.subtotal)
  const total = usePosCartStore((s) => s.total)

  const subtotalValue = subtotal()
  const totalValue = total()
  const hasItems = items.length > 0
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="flex h-full flex-col border-l bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">ตะกร้า</h2>
          {hasItems && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </div>
        {hasItems && (
          <Button
            variant="ghost"
            size="sm"
            className={cn('min-h-[44px] gap-1 text-destructive hover:bg-red-50 hover:text-red-600')}
            onClick={clear}
          >
            <Trash2 className="h-4 w-4" />
            ล้าง
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        {hasItems ? (
          <div className="divide-y">
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-xs text-muted-foreground/60">แตะที่สินค้าเพื่อเพิ่ม</p>
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-muted/30 p-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>รวม ({itemCount} ชิ้น)</span>
            <span>฿{subtotalValue.toLocaleString('th-TH')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-orange-500" />
            <Label htmlFor="discount" className="shrink-0 text-sm">
              ส่วนลด
            </Label>
            <Input
              id="discount"
              type="number"
              min={0}
              max={subtotalValue}
              value={discount || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                setDiscount(Math.min(value, subtotalValue))
              }}
              className="h-8 text-sm"
              placeholder="0"
            />
            <span className="text-sm text-muted-foreground">฿</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>ยอดสุทธิ</span>
            <span className="text-primary">฿{totalValue.toLocaleString('th-TH')}</span>
          </div>
        </div>

        <Button
          className={cn(
            'mt-4 min-h-[52px] w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-300',
            !hasItems && 'opacity-50 shadow-none'
          )}
          size="lg"
          disabled={!hasItems}
          onClick={onCheckout}
        >
          <CreditCard className="h-5 w-5" />
          ชำระเงิน
        </Button>
      </div>
    </div>
  )
}
