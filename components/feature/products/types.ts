import type { Product } from '@/types/product'

export type ProductListProps = {
  products: Product[]
}

export type ProductListItemProps = {
  product: Product
}

export type ProductStatusBadgeProps = {
  isAvailable: boolean
}
