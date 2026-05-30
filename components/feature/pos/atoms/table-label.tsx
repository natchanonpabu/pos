type TableLabelProps = {
  tableId: string | null
}

export function TableLabel({ tableId }: TableLabelProps) {
  return (
    <span className="text-sm font-medium">
      โต๊ะ {tableId ? `#${tableId.slice(-4)}` : '—'}
    </span>
  )
}
