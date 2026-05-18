'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCustomerCartStore } from '@/store/customer-cart.store'
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
        <section key={category}>
          <h2 className="mb-3 text-lg font-semibold">{category}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products
              .filter((p) => p.category === category && p.isAvailable)
              .map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer active:scale-95 transition-transform"
                  onClick={() => addItem(product)}
                >
                  <CardContent className="p-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="mb-2 h-24 w-full rounded-md object-cover"
                      />
                    )}
                    <p className="text-sm font-medium leading-snug">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      ฿{product.price.toFixed(0)}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
