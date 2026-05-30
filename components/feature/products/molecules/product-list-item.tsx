import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProductStatusBadge } from '../atoms'
import type { ProductListItemProps } from '../types'

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No img</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            {product.price.toLocaleString('th-TH')} ฿
          </span>
          <span className="text-sm text-muted-foreground">
            สต๊อก: {product.stock}
          </span>
          <ProductStatusBadge isAvailable={product.isAvailable} />
        </div>
      </div>

      <Link
        href={`/products/${product.id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'min-h-[44px] min-w-[44px]')}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">แก้ไข</span>
      </Link>
    </div>
  )
}
