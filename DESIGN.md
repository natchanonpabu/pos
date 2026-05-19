# POS Web App — System Design

## Problem Statement

ระบบ Point of Sale สำหรับร้านค้า ให้พนักงานสามารถเปิดบิล รับชำระเงิน
และดูรายงานยอดขายได้ผ่าน web browser (รองรับ tablet และ desktop)

---

## Core Features (MVP)

- [ ] **Product catalog** — แสดงและจัดการสินค้า (ชื่อ, ราคา, สต๊อก, หมวดหมู่)
- [ ] **POS Terminal** — เลือกสินค้า, ปรับ quantity, เพิ่มส่วนลด
- [ ] **Cart & Order** — สร้าง order จาก cart, ยืนยัน/ยกเลิก
- [ ] **Payment** — รับชำระเงินสด / QR code / บัตร, ทอนเงิน
- [ ] **Receipt** — พิมพ์ใบเสร็จหลังชำระเงิน
- [ ] **Inventory** — ติดตาม stock, alert เมื่อสินค้าใกล้หมด
- [ ] **Sales Reports** — ยอดขายรายวัน/รายสัปดาห์/รายเดือน, สินค้าขายดี

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Client State | Zustand |
| Server Data | async Server Components + Server Actions |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime subscriptions |

**ทำไมถึงเลือก Zustand ไม่ใช่ Redux:**
- State ของ POS อยู่ระดับ medium (cart, session, UI) — ไม่ซับซ้อนพอที่ Redux จะคุ้ม
- Zustand boilerplate น้อยกว่า ~5x, bundle เล็กกว่า (~1kB vs ~20kB)
- ใช้งานร่วมกับ Server Components ได้ง่ายกว่า

---

## Key Data Models

```typescript
type Table = {
  id: string
  number: number
  isActive: boolean
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl: string | null
  isAvailable: boolean
}

type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled'
type OrderSource = 'staff' | 'customer'

type Order = {
  id: string
  tableId: string | null
  source: OrderSource
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: OrderStatus
  createdAt: Date
}

type Payment = {
  id: string
  orderId: string
  method: 'cash' | 'qr' | 'card'
  amount: number
  change: number
  paidAt: Date
}
```

---

## Page / Route Structure

```
app/
├── layout.tsx                          # Root layout
├── (pos)/                              # Route group — staff interface
│   ├── page.tsx                    → / (POS Terminal — หน้าหลัก)
│   ├── products/
│   │   ├── page.tsx                → /products (Product list)
│   │   └── [id]/
│   │       └── page.tsx            → /products/[id] (Edit product)
│   ├── orders/
│   │   ├── page.tsx                → /orders (Order history)
│   │   └── [id]/
│   │       └── page.tsx            → /orders/[id] (Order detail + receipt)
│   └── reports/
│       └── page.tsx                → /reports (Sales dashboard)
└── table/
    └── [tableId]/
        └── page.tsx                → /table/[tableId] (Customer order page)
```

---

## UI/UX Conventions

- **POS Terminal** (หน้าหลัก): split layout — product grid (ซ้าย) + cart sidebar (ขวา)
- Touch-friendly: buttons ขนาด minimum 44px สำหรับ tablet
- Responsive: tablet (768px) และ desktop (1024px+) เป็น primary targets
- Color: ใช้ shadcn/ui default theme, อาจปรับ primary color ใน `@theme`

---

## Component Hierarchy (หลัก)

**Staff (POS Terminal):**
```
app/(pos)/page.tsx (Server Component)
└── components/pos/IncomingOrderQueue (Client — Supabase real-time)
```

**Customer (Table Order):**
```
app/table/[tableId]/page.tsx (Server Component — fetches table + products)
├── components/customer/MenuGrid (Client — แสดงสินค้าตาม category)
└── components/customer/CartDrawer (Client — Zustand customer-cart store)
```

---

## State ที่ใช้ Zustand

| Store | ข้อมูล |
|-------|--------|
| `customer-cart.store.ts` | items, quantities สำหรับ customer ordering |

**ไม่ใช้ Zustand สำหรับ**: product list, order history, reports — ดึงจาก Server Components

## Real-time (Supabase)

| Hook | ทำอะไร |
|------|--------|
| `useIncomingOrders` | subscribe pending customer orders → แสดงใน POS Terminal |

- ใช้ `supabase.channel().on('postgres_changes', ...)` สำหรับ real-time updates
- Source of truth: `supabase/schema.sql`

---

## Out of Scope (MVP)

- Multi-branch / Multi-register
- Customer loyalty points
- Advanced accounting integration
- Employee permissions / roles
