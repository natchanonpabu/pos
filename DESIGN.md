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
| Database | [กำหนดภายหลัง — Prisma + SQLite หรือ Supabase] |

**ทำไมถึงเลือก Zustand ไม่ใช่ Redux:**
- State ของ POS อยู่ระดับ medium (cart, session, UI) — ไม่ซับซ้อนพอที่ Redux จะคุ้ม
- Zustand boilerplate น้อยกว่า ~5x, bundle เล็กกว่า (~1kB vs ~20kB)
- ใช้งานร่วมกับ Server Components ได้ง่ายกว่า

---

## Key Data Models

```typescript
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl?: string
}

type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'cancelled'
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
├── page.tsx                    → / (POS Terminal — หน้าหลัก)
├── products/
│   ├── page.tsx                → /products (Product list)
│   └── [id]/
│       └── page.tsx            → /products/[id] (Edit product)
├── orders/
│   ├── page.tsx                → /orders (Order history)
│   └── [id]/
│       └── page.tsx            → /orders/[id] (Order detail + receipt)
└── reports/
    └── page.tsx                → /reports (Sales dashboard)
```

---

## UI/UX Conventions

- **POS Terminal** (หน้าหลัก): split layout — product grid (ซ้าย) + cart sidebar (ขวา)
- Touch-friendly: buttons ขนาด minimum 44px สำหรับ tablet
- Responsive: tablet (768px) และ desktop (1024px+) เป็น primary targets
- Color: ใช้ shadcn/ui default theme, อาจปรับ primary color ใน `@theme`

---

## Component Hierarchy (หลัก)

```
app/page.tsx (Server Component)
└── POSLayout (Client — ต้องการ state)
    ├── ProductGrid (Server — fetch products)
    │   └── ProductCard[] (Server)
    └── CartSidebar (Client — Zustand cart store)
        ├── CartItemList
        ├── DiscountInput
        └── CheckoutButton → PaymentModal (Client)
```

---

## State ที่ใช้ Zustand

| Store | ข้อมูล |
|-------|--------|
| `cart.store.ts` | items, quantities, discount |
| `session.store.ts` | cashier name, shift start |
| `ui.store.ts` | modal open/close, sidebar state |

**ไม่ใช้ Zustand สำหรับ**: product list, order history, reports — ดึงจาก Server Components

---

## Out of Scope (MVP)

- Multi-branch / Multi-register
- Customer loyalty points
- Advanced accounting integration
- Employee permissions / roles
