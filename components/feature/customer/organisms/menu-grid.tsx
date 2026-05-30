'use client'

import { useCustomerCartStore } from '@/store/customer-cart.store'
import { MenuSection } from '../molecules'
import type { Product } from '@/types/product'

type MenuGridProps = {
  products: Product[]
}

export function MenuGrid({ products }: MenuGridProps) {
  const addItem = useCustomerCartStore((s) => s.addItem)

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <MenuSection
          key={category}
          category={category}
          products={products.filter((p) => p.category === category && p.isAvailable)}
          onProductClick={addItem}
        />
      ))}
    </div>
  )
}
