import { notFound } from 'next/navigation'
import { tableService } from '@/services/table.service'
import { productService } from '@/services/product.service'
import { CustomerOrderTemplate } from '@/components/feature/customer/template/customer-order-template'

type PageProps = {
  params: Promise<{ tableId: string }>
}

export default async function CustomerOrderPage({ params }: PageProps) {
  const { tableId } = await params

  const [table, products] = await Promise.all([
    tableService.getById(tableId),
    productService.getAvailableProducts(),
  ])

  if (!table) notFound()

  return <CustomerOrderTemplate table={table} products={products} />
}
