'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductListItem } from '../molecules'
import type { ProductListProps } from '../types'

export function ProductList({ products }: ProductListProps) {
  const [search, setSearch] = useState('')

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] pl-9"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            ไม่พบสินค้า
          </p>
        ) : (
          filtered.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  )
}
