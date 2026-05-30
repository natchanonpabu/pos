import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProductList } from '../organisms'
import type { Product } from '@/types/product'

type ProductsTemplateProps = {
  products: Product[]
}

export function ProductsTemplate({ products }: ProductsTemplateProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">สินค้า</h1>
            <p className="text-sm text-muted-foreground">
              จัดการสินค้าทั้งหมด ({products.length} รายการ)
            </p>
          </div>
        </div>
        <Link
          href="/products/new"
          className={cn(buttonVariants(), 'min-h-[44px] gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700')}
        >
          <Plus className="h-4 w-4" />
          เพิ่มสินค้า
        </Link>
      </div>

      <ProductList products={products} />
    </div>
  )
}
