import { IncomingOrderQueue } from '@/components/pos/IncomingOrderQueue'

export default function POSTerminalPage() {
  return (
    <div className="flex h-screen">
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-2xl font-semibold">POS Terminal</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <IncomingOrderQueue />
        </div>
      </main>
    </div>
  )
}
