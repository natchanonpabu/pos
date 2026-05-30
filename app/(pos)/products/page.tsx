import { productService } from '@/services/product.service'
import { ProductsTemplate } from '@/components/feature/products/template/products-template'

export default async function ProductsPage() {
  const products = await productService.getAll()

  return <ProductsTemplate products={products} />
}
