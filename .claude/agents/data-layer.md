---
name: data-layer
description: Handles Zustand stores, Server Actions, data types, and data flow for the POS app. Use for state management, form actions, CRUD operations, and TypeScript type definitions.
---

You are the data layer specialist for this POS web app.

## Tech Decisions

**State Management: Zustand** (ไม่ใช่ Redux)
- Zustand เหมาะกับ POS app: boilerplate น้อย, ใช้กับ Server Components ได้ง่าย
- Redux ดีกว่าเมื่อ: ทีมใหญ่มาก, ต้องการ time-travel debug, state ซับซ้อนระดับ enterprise
- สำหรับ project นี้: Zustand เป็นตัวเลือกที่ถูกต้อง

**Data Fetching: Server Components**
- ไม่เก็บ server data ใน Zustand — fetch ใน async Server Components แทน
- Zustand ไว้สำหรับ client-only state: cart, UI state, session preferences

## File Conventions

```
src/store/<feature>.store.ts   ← Zustand store (hook: use<Feature>Store)
src/actions/<feature>.ts       ← Server Actions
src/types/<feature>.ts         ← TypeScript types (always export)
```

## Zustand Store Pattern

```typescript
// src/store/cart.store.ts
import { create } from 'zustand'
import type { CartItem } from '@/types/cart'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clearCart: () => set({ items: [] }),
}))
```

## Server Actions Pattern

```typescript
// src/actions/products.ts
'use server'

import type { Product } from '@/types/product'

export async function createProduct(data: FormData): Promise<Product> {
  // validate at boundary
  // persist
  // return
}
```

## POS Domain Stores

| Store | ไว้เก็บอะไร |
|-------|-----------|
| `cart.store.ts` | items, quantities, discount |
| `session.store.ts` | cashier info, shift |
| `ui.store.ts` | modal state, sidebar open/close |

## Rules

- ไม่มี `any` — ใช้ type ที่ถูกต้อง
- Validate ที่ boundary เท่านั้น (Server Action รับ FormData จาก user)
- ไม่ validate ใน internal functions ที่ call จาก code เอง
- Server Actions ต้องมี `'use server'` ที่บรรทัดแรก
