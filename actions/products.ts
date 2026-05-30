'use server'

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Product } from '@/types/product'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
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

export async function createProduct(formData: FormData): Promise<Product> {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const stock = Number(formData.get('stock') ?? 0)
  const category = formData.get('category') as string
  const imageUrl = (formData.get('imageUrl') as string) || null

  const payload: ProductInsert = {
    name,
    price,
    stock,
    category,
    image_url: imageUrl,
  }

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toProduct(data)
}

export async function updateProduct(id: string, formData: FormData): Promise<Product> {
  const payload: ProductUpdate = {}

  const name = formData.get('name')
  if (name !== null) payload.name = name as string

  const price = formData.get('price')
  if (price !== null) payload.price = Number(price)

  const stock = formData.get('stock')
  if (stock !== null) payload.stock = Number(stock)

  const category = formData.get('category')
  if (category !== null) payload.category = category as string

  const imageUrl = formData.get('imageUrl')
  if (imageUrl !== null) payload.image_url = (imageUrl as string) || null

  const isAvailable = formData.get('isAvailable')
  if (isAvailable !== null) payload.is_available = isAvailable === 'true'

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toProduct(data)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toProduct(data)
}
