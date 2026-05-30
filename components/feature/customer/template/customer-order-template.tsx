'use client'

import { MenuGrid } from '../organisms'
import { CartDrawer } from '../organisms'
import type { Product } from '@/types/product'
import type { Table } from '@/types/table'

type CustomerOrderTemplateProps = {
  table: Table
  products: Product[]
}

export function CustomerOrderTemplate({ table, products }: CustomerOrderTemplateProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <p className="text-sm text-muted-foreground">โต๊ะ</p>
        <h1 className="text-xl font-bold">โต๊ะที่ {table.number}</h1>
      </header>

      <main className="px-4 py-4">
        <MenuGrid products={products} />
      </main>

      <CartDrawer tableId={table.id} />
    </div>
  )
}
