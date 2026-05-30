import { productService } from '@/services/product.service'
import { PosTerminalTemplate } from '@/components/feature/pos/template/pos-terminal-template'

export default async function POSTerminalPage() {
  const products = await productService.getAvailableProducts()

  return <PosTerminalTemplate products={products} />
}
