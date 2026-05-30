import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/types/product'

type ProductCardProps = {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="cursor-pointer active:scale-95 transition-transform"
      onClick={onClick}
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
  )
}
