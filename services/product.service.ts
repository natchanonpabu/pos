import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Product } from '@/types/product'

type ProductRow = Database['public']['Tables']['products']['Row']

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    stock: row.stock,
    category: row.category,
    imageUrl: row.image_url,
    isAvailable: row.is_available,
  }
}

export const productService = {
  async getAvailableProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('category')

    if (error) throw new Error(error.message)
    return data.map(toProduct)
  },

  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category')

    if (error) throw new Error(error.message)
    return data.map(toProduct)
  },
}
