import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuGrid } from '@/components/customer/MenuGrid'
import { CartDrawer } from '@/components/customer/CartDrawer'
import type { Product } from '@/types/product'
import type { Table } from '@/types/table'

type PageProps = {
  params: Promise<{ tableId: string }>
}

export default async function CustomerOrderPage({ params }: PageProps) {
  const { tableId } = await params

  const [tableResult, productsResult] = await Promise.all([
    supabase.from('tables').select('*').eq('id', tableId).single(),
    supabase.from('products').select('*').eq('is_available', true).order('category'),
  ])

  if (tableResult.error || !tableResult.data) notFound()

  const table = tableResult.data as Table
  const products = (productsResult.data ?? []) as Product[]

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
        <p className="text-sm text-muted-foreground">โต๊ะ</p>
        <h1 className="text-xl font-bold">โต๊ะที่ {table.number}</h1>
      </header>

      <main className="px-4 py-4">
        <MenuGrid products={products} />
      </main>

      <CartDrawer tableId={tableId} />
    </div>
  )
}
