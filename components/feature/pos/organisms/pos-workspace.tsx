'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { usePosCartStore } from '@/store/pos-cart.store'
import { ProductGrid } from '../molecules/product-grid'
import { CartSidebar } from '../molecules/cart-sidebar'
import { PaymentDialog } from '../molecules/payment-dialog'
import type { Product } from '@/types/product'

type PosWorkspaceProps = {
  products: Product[]
}

export function PosWorkspace({ products }: PosWorkspaceProps) {
  const addItem = usePosCartStore((s) => s.addItem)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [lastResult, setLastResult] = useState<{
    orderId: string
    change: number
  } | null>(null)

  function handleCheckout() {
    setPaymentOpen(true)
  }

  function handlePaymentSuccess(orderId: string, change: number) {
    setLastResult({ orderId, change })
    // Auto-dismiss success message after 5 seconds
    setTimeout(() => setLastResult(null), 5000)
  }

  return (
    <div className="flex h-full">
      {/* Product grid — left side */}
      <div className={cn('flex-1 p-4 lg:p-6')}>
        <ProductGrid products={products} onAddToCart={addItem} />
      </div>

      {/* Cart sidebar — right side */}
      <div className="w-[35%] min-w-[320px] max-w-[420px]">
        <CartSidebar onCheckout={handleCheckout} />
      </div>

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={handlePaymentSuccess}
      />

      {/* Success toast */}
      {lastResult && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-xl shadow-emerald-100/50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-lg">✓</span>
          </div>
          <div>
            <p className="font-bold text-emerald-800">ชำระเงินสำเร็จ!</p>
            {lastResult.change > 0 && (
              <p className="text-sm font-medium text-emerald-600">
                เงินทอน: ฿{lastResult.change.toLocaleString('th-TH')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
