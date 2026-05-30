'use client'

import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { Grid3X3, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ProductGridItem } from '../atoms/product-grid-item'

type ProductGridProps = {
  products: Product[]
  onAddToCart: (product: Product) => void
}

const ALL_CATEGORY = 'ทั้งหมด'

const categoryMeta: Record<string, { emoji: string; color: string; activeColor: string }> = {
  ทั้งหมด: {
    emoji: '🏪',
    color: 'bg-slate-100 text-slate-700',
    activeColor: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white',
  },
  เครื่องดื่ม: {
    emoji: '🥤',
    color: 'bg-sky-50 text-sky-700',
    activeColor: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white',
  },
  ซุป: {
    emoji: '🍲',
    color: 'bg-orange-50 text-orange-700',
    activeColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
  },
  อาหารจานเดียว: {
    emoji: '🍛',
    color: 'bg-rose-50 text-rose-700',
    activeColor: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
  },
}

const defaultMeta = {
  emoji: '📦',
  color: 'bg-muted text-muted-foreground',
  activeColor: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white',
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY)
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category)))
    return [ALL_CATEGORY, ...uniqueCategories]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== ALL_CATEGORY) {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    return result
  }, [products, selectedCategory, search])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-border/50 bg-card pl-10 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
          <Grid3X3 className="h-4 w-4" />
          <span>{filteredProducts.length}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex shrink-0 gap-2 overflow-x-auto py-1">
        {categories.map((category) => {
          const meta = categoryMeta[category] ?? defaultMeta
          const isSelected = selectedCategory === category

          return (
            <button
              key={category}
              type="button"
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                'min-h-11 border-0 outline-none',
                isSelected ? cn(meta.activeColor, 'shadow-md') : cn(meta.color, 'hover:opacity-80'),
              )}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="text-base">{meta.emoji}</span>
              {category}
            </button>
          )
        })}
      </div>

      {/* Product grid */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-3 lg:grid-cols-4 pb-4">
          {filteredProducts.map((product) => (
            <ProductGridItem key={product.id} product={product} onAdd={onAddToCart} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex h-48 flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">ไม่พบสินค้า</p>
            <p className="text-xs text-muted-foreground/60">ลองค้นหาด้วยคำอื่น</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
