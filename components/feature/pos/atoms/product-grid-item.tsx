'use client'

import { ShoppingCart, ImageOff, UtensilsCrossed, Coffee, Soup } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

type ProductGridItemProps = {
  product: Product
  onAdd: (product: Product) => void
}

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  'เครื่องดื่ม': { bg: 'from-sky-400 to-cyan-500', text: 'text-sky-700', icon: '🥤' },
  'ซุป': { bg: 'from-orange-400 to-amber-500', text: 'text-orange-700', icon: '🍲' },
  'อาหารจานเดียว': { bg: 'from-rose-400 to-pink-500', text: 'text-rose-700', icon: '🍛' },
}

const defaultColor = { bg: 'from-violet-400 to-indigo-500', text: 'text-violet-700', icon: '🍽️' }

export function ProductGridItem({ product, onAdd }: ProductGridItemProps) {
  const isOutOfStock = product.stock <= 0
  const color = categoryColors[product.category] ?? defaultColor

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-200',
        'hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10',
        'active:scale-[0.97] active:shadow-sm',
        isOutOfStock && 'cursor-not-allowed opacity-40 grayscale hover:shadow-sm'
      )}
      onClick={() => {
        if (!isOutOfStock) {
          onAdd(product)
        }
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {product.imageUrl ? (
          <div className="h-24 w-24 overflow-hidden rounded-2xl shadow-inner">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className={cn(
            'flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-200 group-hover:scale-105',
            color.bg
          )}>
            <span className="text-4xl drop-shadow-sm">
              {color.icon}
            </span>
          </div>
        )}

        <div className="w-full text-center">
          <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
          <p className={cn('mt-1 text-lg font-black', color.text)}>
            ฿{product.price.toLocaleString('th-TH')}
          </p>
        </div>

        {isOutOfStock ? (
          <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1">
            <ImageOff className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-bold text-red-600">หมดสต๊อก</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
            <ShoppingCart className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">+ เพิ่มลงตะกร้า</span>
          </div>
        )}
      </div>
    </div>
  )
}
