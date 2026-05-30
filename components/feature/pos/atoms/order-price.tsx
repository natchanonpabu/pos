type OrderPriceProps = {
  amount: number
}

export function OrderPrice({ amount }: OrderPriceProps) {
  return <span className="text-sm font-bold">฿{amount.toFixed(0)}</span>
}
