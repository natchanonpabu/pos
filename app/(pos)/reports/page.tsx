import { orderService } from '@/services/order.service'
import { Card } from '@/components/ui/card'
import { Banknote, ShoppingCart, TrendingUp, Clock, Receipt } from 'lucide-react'

export default async function ReportsPage() {
  const todayOrders = await orderService.getTodayOrders()

  const paidOrders = todayOrders.filter((order) => order.status === 'paid')
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = paidOrders.length > 0
    ? totalRevenue / paidOrders.length
    : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">รายงาน</h1>
        <p className="text-sm text-muted-foreground">
          สรุปยอดขายวันนี้ — {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-200">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-100">รายได้วันนี้</p>
              <p className="text-2xl font-black">
                ฿{totalRevenue.toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white shadow-lg shadow-violet-200">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-violet-100">จำนวนออเดอร์</p>
              <p className="text-2xl font-black">
                {paidOrders.length} รายการ
              </p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg shadow-amber-200">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-100">เฉลี่ยต่อออเดอร์</p>
              <p className="text-2xl font-black">
                ฿{averageOrderValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">ออเดอร์ทั้งหมดวันนี้</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {todayOrders.length}
          </span>
        </div>
        {todayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">ยังไม่มีออเดอร์วันนี้</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {order.createdAt.toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-base font-bold text-primary">
                  ฿{order.total.toLocaleString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
