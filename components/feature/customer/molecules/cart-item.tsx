'use client'

import { QuantityControl } from '../atoms'
import type { CartItem as CartItemType } from '../types'

type CartItemProps = {
  item: CartItemType
  onIncrement: () => void
  onDecrement: () => void
}

export function CartItem({ item, onIncrement, onDecrement }: CartItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          ฿{(item.product.price * item.quantity).toFixed(0)}
        </p>
      </div>
      <QuantityControl
        quantity={item.quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
    </div>
  )
}
