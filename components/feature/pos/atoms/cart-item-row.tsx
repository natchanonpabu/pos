'use client'

import { Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PosCartItem } from '@/store/pos-cart.store'

type CartItemRowProps = {
  item: PosCartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { product, quantity } = item
  const lineTotal = product.price * quantity

  return (
    <div className="flex items-center gap-2 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100">
        <span className="text-sm font-bold text-violet-600">{product.name.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          ฿{product.price.toLocaleString('th-TH')} x {quantity}
        </p>
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="outline"
          size="icon"
          className={cn('h-7 w-7 rounded-full border-muted')}
          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
          aria-label="ลดจำนวน"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-7 text-center text-sm font-bold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-7 w-7 rounded-full border-muted')}
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          aria-label="เพิ่มจำนวน"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="w-16 text-right">
        <p className="text-sm font-bold text-foreground">
          ฿{lineTotal.toLocaleString('th-TH')}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500')}
        onClick={() => onRemove(product.id)}
        aria-label="ลบสินค้า"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
