'use client'

import { ProductCard } from '../atoms'
import type { Product } from '@/types/product'

type MenuSectionProps = {
  category: string
  products: Product[]
  onProductClick: (product: Product) => void
}

export function MenuSection({ category, products, onProductClick }: MenuSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{category}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </section>
  )
}
