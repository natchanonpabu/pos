import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Table } from '@/types/table'

type TableRow = Database['public']['Tables']['tables']['Row']

function toTable(row: TableRow): Table {
  return {
    id: row.id,
    number: row.number,
    isActive: row.is_active,
  }
}

export const tableService = {
  async getById(tableId: string): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .single()

    if (error) return null
    return toTable(data)
  },
}
