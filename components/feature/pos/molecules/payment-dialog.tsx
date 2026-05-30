'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePosCartStore } from '@/store/pos-cart.store'
import { createStaffOrderAndPay } from '@/actions/payments'
import type { OrderItem, Payment } from '@/types/order'

type PaymentMethod = Payment['method']

type PaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (orderId: string, change: number) => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string; color: string }[] = [
  { value: 'cash', label: 'เงินสด', icon: '💵', color: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { value: 'qr', label: 'QR Code', icon: '📱', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { value: 'card', label: 'บัตร', icon: '💳', color: 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' },
]

export function PaymentDialog({ open, onOpenChange, onSuccess }: PaymentDialogProps) {
  const items = usePosCartStore((s) => s.items)
  const discount = usePosCartStore((s) => s.discount)
  const total = usePosCartStore((s) => s.total)
  const clear = usePosCartStore((s) => s.clear)

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amountReceived, setAmountReceived] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalValue = total()
  const amountValue = parseFloat(amountReceived) || 0
  const change = method === 'cash' ? Math.max(0, amountValue - totalValue) : 0
  const isAmountSufficient = method === 'cash' ? amountValue >= totalValue : true

  function handleMethodChange(newMethod: PaymentMethod) {
    setMethod(newMethod)
    setError(null)
    if (newMethod !== 'cash') {
      setAmountReceived(totalValue.toString())
    } else {
      setAmountReceived('')
    }
  }

  function handleSubmit() {
    if (!isAmountSufficient) {
      setError('จำนวนเงินไม่เพียงพอ')
      return
    }

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }))

    const finalAmount = method === 'cash' ? amountValue : totalValue

    startTransition(async () => {
      const result = await createStaffOrderAndPay({
        items: orderItems,
        discount,
        method,
        amountReceived: finalAmount,
      })

      if (result.success && result.orderId !== undefined) {
        clear()
        setAmountReceived('')
        setMethod('cash')
        setError(null)
        onOpenChange(false)
        onSuccess(result.orderId, result.change ?? 0)
      } else {
        setError(result.error ?? 'เกิดข้อผิดพลาด')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ชำระเงิน</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Total display */}
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5 text-center">
            <p className="text-sm font-medium text-violet-600">ยอดที่ต้องชำระ</p>
            <p className="mt-1 text-4xl font-black text-violet-700">
              ฿{totalValue.toLocaleString('th-TH')}
            </p>
          </div>

          {/* Payment method selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">วิธีชำระเงิน</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <Button
                  key={pm.value}
                  variant="outline"
                  className={cn(
                    'min-h-[56px] flex-col gap-1 border-2 text-xs font-semibold transition-all',
                    method === pm.value
                      ? pm.color + ' ring-2 ring-offset-1 ring-current/20 scale-[1.02]'
                      : 'hover:border-muted-foreground/30'
                  )}
                  onClick={() => handleMethodChange(pm.value)}
                >
                  <span className="text-lg">{pm.icon}</span>
                  {pm.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Cash amount input */}
          {method === 'cash' && (
            <div className="space-y-2">
              <Label htmlFor="amount-received">จำนวนเงินที่ได้รับ</Label>
              <Input
                id="amount-received"
                type="number"
                min={0}
                value={amountReceived}
                onChange={(e) => {
                  setAmountReceived(e.target.value)
                  setError(null)
                }}
                placeholder={totalValue.toString()}
                className="h-12 text-lg"
                autoFocus
              />

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>เงินทอน</span>
                <span className={cn(change > 0 && 'text-green-600')}>
                  {change.toLocaleString('th-TH')} ฿
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className={cn('min-h-[44px]')}
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            className={cn('min-h-[44px] gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 font-bold shadow-md hover:from-emerald-600 hover:to-teal-700')}
            onClick={handleSubmit}
            disabled={isPending || (method === 'cash' && !isAmountSufficient)}
          >
            {isPending ? '⏳ กำลังดำเนินการ...' : '✓ ยืนยันชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
