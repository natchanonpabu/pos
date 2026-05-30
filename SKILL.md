# Skill Guide — POS Project

extends: ~/.claude/skills/skill-1-personal.md

POS project ใช้ skill-1-personal เป็นฐาน และเพิ่ม project-specific conventions ด้านล่าง

---

## Tech Stack

| Tech | Version | หมายเหตุ |
|------|---------|---------|
| Next.js | 16.2.6 | App Router — อ่าน `node_modules/next/dist/docs/` ก่อน code |
| React | 19.2.4 | ใช้ `use()`, `useActionState()`, Server Actions |
| TypeScript | 5 | strict mode เสมอ |
| Tailwind CSS | 4 | ใช้ `@theme` ใน `globals.css`, ไม่มี `tailwind.config.js` |
| shadcn/ui | latest | Radix UI primitives |
| Zustand | 5.x | client state เท่านั้น |
| Supabase | 2.x | database + real-time |

---

## shadcn/ui Conventions

- ติดตั้ง: `npx shadcn@latest add <component>`
- Components อยู่ที่ `components/ui/` — **ห้ามแก้ไฟล์ใน ui/ โดยตรง**
- ต้องการ extend → wrap เป็น component ใหม่ข้างนอก:
  ```typescript
  // components/pos/IncomingOrderCard.tsx
  import { Card } from '@/components/ui/card'
  export function IncomingOrderCard({ order, ...props }) {
    return <Card {...props}>{order.id}</Card>
  }
  ```
- ใช้ `cn()` จาก `lib/utils` สำหรับ conditional className **เสมอ**

## Tailwind v4 Notes

- กำหนด custom theme ใน `app/globals.css` ด้วย `@theme { ... }`
- Responsive breakpoints: `sm:` `md:` `lg:` ใช้ได้ปกติ
- Dark mode: `dark:` variant (ถ้า enable)
- ไม่มี `purge`, ไม่มี `content` config — v4 จัดการเอง

---

## State Management: Zustand

```
store/
└── customer-cart.store.ts  → items, quantities สำหรับ customer ordering
```

- Hook ตั้งชื่อ: `use<Feature>Store` (เช่น `useCustomerCartStore`)
- ไม่เก็บ server data ใน store — fetch ใน async Server Components
- ถ้าต้องการ persist: ใช้ `zustand/middleware` (persist)

## Supabase

```
lib/supabase.ts        → client singleton (createBrowserClient)
supabase/schema.sql    → source of truth สำหรับ DB schema
```

- ดึงข้อมูลใน Server Components: `const supabase = createServerClient(...)` หรือผ่าน Server Actions
- Real-time ใน Client hooks: `supabase.channel().on('postgres_changes', callback).subscribe()`
- ไม่ใช้ Prisma — ใช้ Supabase client โดยตรง
- ไม่สร้าง `/api/` routes สำหรับ DB access — ใช้ Server Actions แทน

## Server Actions

```typescript
// actions/orders.ts
'use server'
// validate input → process → return typed result
```

- ไม่สร้าง `/api/` routes สำหรับ mutations — ใช้ Server Actions แทน
- `/api/` routes ไว้สำหรับ webhook หรือ external integrations เท่านั้น

---

## File Structure

```
(project root)/
├── app/                      # Routes (Next.js App Router)
│   ├── (pos)/                # Staff routes (route group)
│   └── table/                # Customer routes
├── components/
│   ├── ui/                   # shadcn/ui (ห้ามแก้)
│   └── feature/              # Feature components (Atomic Design)
│       ├── pos/              # POS terminal feature
│       │   ├── atoms/        # Basic UI elements
│       │   ├── molecules/    # Atom compositions
│       │   ├── organisms/    # Complex sections
│       │   ├── template/     # Page-level layout
│       │   └── types.ts
│       └── customer/         # Customer-facing feature
│           ├── atoms/
│           ├── molecules/
│           ├── organisms/
│           ├── template/
│           └── types.ts
├── services/                 # Service layer (data fetching)
├── actions/                  # Server Actions (mutations)
├── lib/                      # utilities (utils.ts, supabase.ts)
├── hooks/                    # custom hooks (use<Name>.ts) — real-time
├── store/                    # Zustand stores
├── supabase/                 # DB schema + migrations
└── types/                    # TypeScript types
```

## Component Architecture: Atomic Design (feature-arch)

ทุก feature ใช้โครงสร้าง Atomic Design:

| Level | หน้าที่ | ตัวอย่าง |
|-------|---------|---------|
| atoms | UI element เดียว, presentational | OrderBadge, ProductCard, QuantityControl |
| molecules | compose atoms 2-3 ตัว + มี logic | OrderCard, MenuSection, CartItem |
| organisms | complete section, ใช้ hooks/service | IncomingOrderQueue, MenuGrid, CartDrawer |
| template | full page layout, compose organisms | PosTerminalTemplate, CustomerOrderTemplate |

**Rules:**
- atoms ห้าม import molecules/organisms/template
- molecules ห้าม import organisms/template
- organisms ห้าม import template
- ทุก level ต้องมี `index.ts` สำหรับ barrel exports
- feature มี `types.ts` แยก

## Service Layer (service-gen)

```
services/
├── order.service.ts      # Order queries + status updates
├── product.service.ts    # Product queries
├── table.service.ts      # Table queries
└── index.ts              # Barrel exports
```

**Pattern:**
- Object-based service: `export const orderService = { ... }`
- ใช้ Supabase client โดยตรง
- ไม่ใช้ data-fetching library (ไม่มี React Query/SWR)
- Server Components ใช้ service methods ดึงข้อมูล
- Client hooks (real-time) อยู่ใน `hooks/`
- Mutations อยู่ใน `actions/` (Server Actions)

---

## Coding Rules (สรุป)

| Rule | ทำ | ไม่ทำ |
|------|-----|-------|
| Component default | Server Component | `"use client"` ทุกไฟล์ |
| Data fetching | async Server Component | `useEffect` + `fetch` |
| Form submit | Server Action | POST ไป `/api/` |
| State | Zustand (client) | Redux |
| Types | explicit types | `any` |
| Class merging | `cn()` | template literals |
| shadcn extend | wrap | แก้ไฟล์ใน `ui/` |

---

## Dependencies ที่ต้องติดตั้ง

```bash
npx shadcn@latest init              # setup shadcn
npm install zustand                 # state management
npm install @supabase/supabase-js   # database + real-time
```
