'use client'

import { Button } from '@/components/ui/button'

type QuantityControlProps = {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}

export function QuantityControl({ quantity, onIncrement, onDecrement }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrement}
      >
        −
      </Button>
      <span className="w-6 text-center text-sm">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrement}
      >
        +
      </Button>
    </div>
  )
}
