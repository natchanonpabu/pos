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
| Zustand | latest | client state เท่านั้น |

---

## shadcn/ui Conventions

- ติดตั้ง: `npx shadcn@latest add <component>`
- Components อยู่ที่ `src/components/ui/` — **ห้ามแก้ไฟล์ใน ui/ โดยตรง**
- ต้องการ extend → wrap เป็น component ใหม่ข้างนอก:
  ```typescript
  // src/components/product/ProductButton.tsx
  import { Button } from '@/components/ui/button'
  export function ProductButton({ product, ...props }) {
    return <Button size="lg" {...props}>{product.name}</Button>
  }
  ```
- ใช้ `cn()` จาก `src/lib/utils` สำหรับ conditional className **เสมอ**

## Tailwind v4 Notes

- กำหนด custom theme ใน `app/globals.css` ด้วย `@theme { ... }`
- Responsive breakpoints: `sm:` `md:` `lg:` ใช้ได้ปกติ
- Dark mode: `dark:` variant (ถ้า enable)
- ไม่มี `purge`, ไม่มี `content` config — v4 จัดการเอง

---

## State Management: Zustand

```
src/store/
├── cart.store.ts     → items, quantities, discount
├── session.store.ts  → cashier, shift
└── ui.store.ts       → modal, sidebar state
```

- Hook ตั้งชื่อ: `use<Feature>Store` (เช่น `useCartStore`)
- ไม่เก็บ server data ใน store — fetch ใน async Server Components
- ถ้าต้องการ persist: ใช้ `zustand/middleware` (persist)

## Server Actions

```typescript
// src/actions/products.ts
'use server'
// validate input → process → return typed result
```

- ไม่สร้าง `/api/` routes สำหรับ mutations — ใช้ Server Actions แทน
- `/api/` routes ไว้สำหรับ webhook หรือ external integrations เท่านั้น

---

## File Structure

```
src/
├── app/                      # Routes (Next.js App Router)
├── components/
│   ├── ui/                   # shadcn/ui (ห้ามแก้)
│   ├── pos/                  # POS terminal components
│   ├── product/              # Product management components
│   ├── cart/                 # Cart components
│   ├── order/                # Order components
│   └── shared/               # ใช้ข้าม feature
├── actions/                  # Server Actions
├── lib/                      # utilities (utils.ts, etc.)
├── hooks/                    # custom hooks (use<Name>.ts)
├── store/                    # Zustand stores
└── types/                    # TypeScript types
```

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
npx shadcn@latest init    # setup shadcn
npm install zustand       # state management
```
