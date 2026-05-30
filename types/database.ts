export type Database = {
  public: {
    Tables: {
      tables: {
        Row: {
          id: string
          number: number
          is_active: boolean
        }
        Insert: {
          id?: string
          number: number
          is_active?: boolean
        }
        Update: {
          id?: string
          number?: number
          is_active?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          stock: number
          category: string
          image_url: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock?: number
          category: string
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock?: number
          category?: string
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          table_id: string | null
          source: 'staff' | 'customer'
          subtotal: number
          discount: number
          total: number
          status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          table_id?: string | null
          source: 'staff' | 'customer'
          subtotal?: number
          discount?: number
          total?: number
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          table_id?: string | null
          source?: 'staff' | 'customer'
          subtotal?: number
          discount?: number
          total?: number
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_table_id_fkey'
            columns: ['table_id']
            isOneToOne: false
            referencedRelation: 'tables'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          name: string
          price: number
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          name: string
          price: number
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          name?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'staff' | 'manager'
          avatar_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'staff' | 'manager'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'staff' | 'manager'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method: 'cash' | 'qr' | 'card'
          amount: number
          change: number
          paid_at: string
        }
        Insert: {
          id?: string
          order_id: string
          method: 'cash' | 'qr' | 'card'
          amount: number
          change?: number
          paid_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          method?: 'cash' | 'qr' | 'card'
          amount?: number
          change?: number
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
