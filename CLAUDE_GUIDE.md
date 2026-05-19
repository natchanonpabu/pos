# Claude Guide — POS Project

คู่มือนี้อธิบายวิธีที่ Claude (AI assistant) ทำงานในโปรเจกต์นี้ ครอบคลุมทุกไฟล์ configuration, ลำดับการโหลด context, การทำงานของ agents, และ flow ตั้งแต่ต้นจนจบเมื่อรับ task

---

## ภาพรวม: ระบบ 3 ชั้น

Claude ไม่ได้ทำงานด้วย "prompt เดียว" — มันโหลด context จากหลายชั้น เรียงจากกว้างที่สุดไปแคบที่สุด:

```
ชั้น 1: Global Config (~/.claude/)   ← อยู่บนเครื่องเจ้าของ repo เท่านั้น ไม่อยู่ใน repo
        │
        │  "base coding style สำหรับทุกโปรเจกต์ของเจ้าของ repo"
        ↓
ชั้น 2: Project Config (project root)
  └── CLAUDE.md  →  @AGENTS.md
                 →  @DESIGN.md
                 →  @SKILL.md
        │
        │  "เรียนรู้ว่าโปรเจกต์นี้คืออะไร, ทำอะไร, ใช้อะไร"
        ↓
ชั้น 3: Runtime Config (.claude/)
  └── settings.local.json  →  permissions
  └── agents/              →  specialized sub-agents
```

ทุก conversation ที่เปิดในโปรเจกต์นี้ Claude จะโหลด context ทั้ง 3 ชั้นนี้โดยอัตโนมัติก่อนตอบคำถามแรก

---

## ลำดับ Context Loading (ตั้งแต่เปิด conversation จนพร้อมรับ task)

```
1. ~/.claude/  (global config — ไม่อยู่ใน repo, ข้ามไปได้เลย)

2. CLAUDE.md (project root)               ← Project entry point
   ├── @AGENTS.md                           ← Next.js 16 breaking changes warning
   ├── @DESIGN.md                           ← System design + data models
   └── @SKILL.md                            ← Tech stack + conventions

3. .claude/settings.local.json            ← Permissions (allow npm install)

4. Memory files (ถ้ามี)                   ← บันทึกจาก conversation ก่อนหน้า
   └── ~/.claude/projects/.../memory/
```

**หมายเหตุ:** สัญลักษณ์ `@` ใน `.md` files คือ "include" — Claude จะอ่านไฟล์นั้นเหมือนกับ copy เนื้อหามาแทนที่

---

## แต่ละไฟล์ Configuration ทำหน้าที่อะไร

### Global Config (`~/.claude/`) — ไม่อยู่ใน repo

ไฟล์เหล่านี้อยู่บนเครื่องเจ้าของ repo เท่านั้น **ไม่ต้องสนใจและไม่ต้องหาในโปรเจกต์** conventions ทั้งหมดที่ต้องรู้สำหรับการทำงานกับโปรเจกต์นี้อยู่ใน [SKILL.md](SKILL.md) แล้ว

### Project Files (root level)

| ไฟล์ | ทำหน้าที่ | Claude ใช้ทำอะไร |
|------|-----------|----------------|
| `CLAUDE.md` | Project entry point, `@include` 3 ไฟล์หลัก | โหลดทุก conversation |
| `AGENTS.md` | เตือนว่า Next.js 16 มี breaking changes | ป้องกันการ code ผิด API |
| `DESIGN.md` | System design, data models, route structure, out-of-scope | รู้ว่าโปรเจกต์ทำอะไร ไม่ทำอะไร |
| `SKILL.md` | Tech stack versions, file structure, coding rules | รู้ว่า code ยังไง วางไฟล์ไว้ที่ไหน |

**เหตุผลที่แยก 3 ไฟล์แทนที่จะเขียนรวมใน `CLAUDE.md`:**
- แต่ละไฟล์มี "เหตุผลในการเปลี่ยน" ต่างกัน — Design เปลี่ยนเมื่อ feature เปลี่ยน, Skill เปลี่ยนเมื่อเพิ่ม library ใหม่
- อ่านง่ายกว่า หาเจอเร็วกว่าเมื่อต้องการแก้ส่วนใดส่วนหนึ่ง

### Runtime Files (`.claude/`)

| ไฟล์ | ทำหน้าที่ |
|------|-----------|
| `settings.local.json` | Permissions — บอก Claude ว่า command ไหนรันได้โดยไม่ต้องถาม |
| `agents/reviewer.md` | ตัวอย่าง sub-agent: ทำ code review |
| `agents/senior-frontend.md` | ตัวอย่าง sub-agent: จัด component structure |
| `agents/data-layer.md` | ตัวอย่าง sub-agent: Zustand + Server Actions |
| `agents/ui-builder.md` | ตัวอย่าง sub-agent: สร้าง UI ด้วย shadcn/ui + Tailwind |

---

## คู่มือสำหรับมือใหม่: ก่อนจะเริ่มใช้ Claude กับโปรเจกต์นี้

> ถ้าเคยใช้ Claude แค่ในเว็บ claude.ai สำหรับถามตอบ — อ่านส่วนนี้ก่อน มันจะต่างกันมาก

### Claude Code ≠ Claude.ai Web

| | Claude.ai (เว็บ) | Claude Code (CLI) |
|--|--|--|
| เปิดที่ | browser | terminal |
| อ่านไฟล์โปรเจกต์ได้ | ต้อง paste เอง | ได้เอง อัตโนมัติ |
| รู้จัก DESIGN.md, SKILL.md | ไม่รู้ | โหลดทุก conversation |
| ใช้ Agents ได้ | ไม่ได้ | ได้ |
| แก้ไขไฟล์ได้ | ไม่ได้ | ได้ |
| รัน command ได้ | ไม่ได้ | ได้ |

**สรุปง่ายๆ:** Claude.ai = คุยกับ AI ทั่วไป, Claude Code = AI ที่นั่งทำงานอยู่ในโปรเจกต์ด้วยกัน

### Agent คืออะไร

ถ้า Claude ปกติเปรียบเหมือน "developer ที่รู้ทุกเรื่อง" — Agent คือ "ผู้เชี่ยวชาญเฉพาะด้าน" ที่ Claude สามารถปรึกษาได้

```
Claude ปกติ:   รู้ทุกเรื่อง แต่ตอบแบบกลางๆ
                    │
                    ├─ spawn → reviewer    (โฟกัสแค่: หาข้อผิดพลาดใน code)
                    ├─ spawn → ui-builder  (โฟกัสแค่: สร้าง UI ด้วย shadcn + Tailwind)
                    ├─ spawn → data-layer  (โฟกัสแค่: Zustand + Server Actions)
                    └─ spawn → senior-frontend (โฟกัสแค่: จัด structure ให้ถูก)
```

แต่ละ Agent มี "คำสั่ง" ของตัวเองอยู่ในไฟล์ `.md` ซึ่งบอกว่าต้องโฟกัสอะไร ตรวจสอบอะไร และ output ออกมาในรูปแบบไหน

### Agent Files อยู่ที่ไหน และต้องสร้างเองไหม

**ไม่ต้องสร้างเอง** — ไฟล์ agent ทั้งหมดถูก commit ไว้ใน git repo แล้ว:

```
.claude/
└── agents/
    ├── reviewer.md          ✓ อยู่ใน repo
    ├── senior-frontend.md   ✓ อยู่ใน repo
    ├── data-layer.md        ✓ อยู่ใน repo
    └── ui-builder.md        ✓ อยู่ใน repo
```

แค่ `git clone` โปรเจกต์ ก็ได้ไฟล์เหล่านี้มาทันที

> **หมายเหตุ:** `settings.local.json` ไม่ได้ commit (มีคำว่า "local" ในชื่อ = เก็บไว้เฉพาะเครื่องตัวเอง) ถ้าอยากได้ permission เดิม ต้องสร้างไฟล์นี้ขึ้นมาเองดูรายละเอียดใน [วิธีเพิ่ม Permission](#วิธีเพิ่มแก้-configuration)

### ต้องติดตั้งอะไรบ้าง

**ต้องการ Claude Code CLI** ถึงจะใช้ agents และ context loading ทั้งหมดได้:

```bash
# ติดตั้ง Claude Code
npm install -g @anthropic-ai/claude-code

# เข้าโปรเจกต์แล้วเปิด
cd pos
claude
```

ครั้งแรกจะให้ login ด้วย Anthropic account (ต้องมี subscription)

### วิธีใช้ Agent เมื่อติดตั้งแล้ว

**แบบที่ 1 — Claude spawn เอง (พบบ่อยที่สุด)**

Claude จะ spawn agent ที่เหมาะสมโดยอัตโนมัติเมื่อเห็นว่า task นั้นเหมาะ เช่น:
- เขียน component เสร็จ → spawn reviewer ตรวจ
- task เป็นเรื่อง UI → spawn ui-builder

**แบบที่ 2 — เรียกเองตรงๆ**

พิมพ์ใน chat บอก Claude ว่าอยากให้ใช้ agent ไหน:
```
"ช่วย review code ที่เพิ่งเขียนด้วย reviewer agent หน่อย"
"ให้ senior-frontend agent ตรวจ structure ให้หน่อย"
```

---

### ถ้าไม่มี Claude Code — ยังทำได้ไหม?

**ได้ แต่ต้องทำ manual เพิ่มขึ้นมาก**

ถ้าใช้ Claude.ai web หรือ Claude ใน IDE plugin (ไม่ใช่ Claude Code CLI):

**สิ่งที่หายไป:**
- Context loading อัตโนมัติ — Claude จะไม่รู้จัก DESIGN.md, SKILL.md โดยอัตโนมัติ
- Agents — ไม่มีการ spawn อัตโนมัติ
- Memory — ไม่มีข้ามการสนทนา

**วิธีทำแบบ manual:**

1. **แทน CLAUDE.md chain** — เปิดไฟล์ DESIGN.md และ SKILL.md แล้ว paste เนื้อหาลงใน chat ก่อนเริ่ม task ทุกครั้ง

2. **แทน Agent** — เปิดไฟล์ `.claude/agents/<agent-name>.md` แล้ว paste เนื้อหาลงใน chat พร้อมบอกว่า "ทำตาม instructions นี้":
   ```
   [paste เนื้อหาจาก reviewer.md]
   ช่วย review code นี้ให้หน่อย: [paste code]
   ```

3. **แทน Memory** — จดบันทึก decisions สำคัญไว้เองใน Notion/docs แล้วนำมา paste ใหม่ทุกครั้ง

> **แนะนำ:** ถ้าจะทำโปรเจกต์นี้จริงจัง ลงทุนเวลา 10 นาทีติดตั้ง Claude Code — ประหยัดเวลา paste context ซ้ำๆ ได้มาก และได้ผลลัพธ์ที่ consistent กว่า

### Checklist ก่อนเริ่มทำงาน

```
[ ] ติดตั้ง Claude Code CLI แล้ว (npm install -g @anthropic-ai/claude-code)
[ ] Login ด้วย Anthropic account แล้ว (claude auth login)
[ ] git clone repo มาแล้ว (ได้ agent files มาด้วย)
[ ] รัน pnpm install แล้ว
[ ] สร้าง .env.local แล้ว (ดูตัวอย่างจาก .env.example ถ้ามี)
[ ] เปิด Claude Code ด้วย claude ใน terminal แล้ว
```

ถ้า checklist ผ่านครบ — Claude จะรู้จักโปรเจกต์นี้ทันที ไม่ต้องอธิบาย context ซ้ำ

---

## Specialized Agents — ทำอะไร เรียกใช้เมื่อไหร่

Agents คือ Claude instances ที่ถูก "configure" ให้เชี่ยวชาญเรื่องใดเรื่องหนึ่ง Claude หลักจะ spawn agents เหล่านี้เพื่องานเฉพาะทาง

### `reviewer` — Code Reviewer

**เรียกใช้เมื่อ:** หลังเขียน code ใหม่, ก่อน commit, หรือเมื่อ "รู้สึกว่ามีอะไรผิด"

**ตรวจสอบ:**
- Server/Client Component boundary ถูกต้องไหม
- มี `useEffect` สำหรับ data fetching ไหม (ห้าม)
- Form submission ใช้ Server Actions ไหม
- ไม่มี server data ใน Zustand
- ไม่มี `any`, ฟังก์ชัน single responsibility, ใช้ `cn()` ถูกที่
- File อยู่ถูก folder, shadcn ไม่ถูกแก้ตรงๆ
- Server Actions validate input, ไม่มี XSS risk, ไม่มี secrets ใน client

**Output format:**
```
## ผ่าน ✓       ← สิ่งที่ทำถูกต้อง
## ปัญหา ✗
### Critical    ← [file:line] ปัญหา → วิธีแก้
### Minor
## แนะนำ        ← ไม่บังคับ
```

---

### `senior-frontend` — Component Structure

**เรียกใช้เมื่อ:** สร้าง component ใหม่, refactor โครงสร้างไฟล์, ต้องการ enforce file structure

**ทำอะไร:**
- อ่าน `SKILL.md` และ `DESIGN.md` ก่อนทุก task
- กำหนดว่า component ไหนเป็น Server vs Client
- จัดวาง component ใน folder ที่ถูกต้อง
- แยก large component ที่มี interactive ส่วนเดียวออกเป็น Client sub-component
- Extract เมื่อเห็น code ซ้ำ 3 ครั้ง

**กฎ Server vs Client:**
| ใช้ | ไม่ใช้ `"use client"` | ใช้ `"use client"` |
|-----|--------------------|-----------------|
| | Static layouts | `useState` / `useReducer` |
| | Data display | `useEffect` |
| | Async data fetching | Event handlers (`onClick`, etc.) |
| | | Browser API (`localStorage`, etc.) |

---

### `data-layer` — State & Data Flow

**เรียกใช้เมื่อ:** สร้าง Zustand store ใหม่, เขียน Server Actions, นิยาม TypeScript types

**Pattern สำคัญ:**

```typescript
// Store: src/store/<feature>.store.ts
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))
```

```typescript
// Server Action: src/actions/<feature>.ts
'use server'
export async function createProduct(data: FormData): Promise<Product> {
  // validate input (boundary) → persist → return
}
```

**POS Stores ที่วางแผนไว้:**

| Store | เก็บอะไร |
|-------|---------|
| `customer-cart.store.ts` | items, quantities สำหรับ customer ordering (มีแล้ว) |
| `cart.store.ts` | items, quantities, discount สำหรับ staff POS |
| `session.store.ts` | cashier info, shift |
| `ui.store.ts` | modal state, sidebar open/close |

**กฎสำคัญ:** ไม่เก็บ server data ใน Zustand เด็ดขาด — ดึงใน async Server Components แทน

---

### `ui-builder` — UI Implementation

**เรียกใช้เมื่อ:** สร้างหน้าใหม่, layout, form, หรือ component ที่หนักด้าน UI

**ลำดับการสร้าง component:**
1. ตรวจ shadcn/ui catalog ก่อน — มี `Button`, `Input`, `Card`, `Dialog`, `Table`, `Select`, `Form` ฯลฯ
2. ถ้ามีใน shadcn → ใช้เลย อย่าสร้างซ้ำ
3. ถ้าต้อง custom → wrap shadcn component อย่าสร้างจากศูนย์
4. ติดตั้ง shadcn component ด้วย: `npx shadcn@latest add <name>`

**POS UI Patterns:**
- **POS Terminal**: grid layout, touch-friendly (ปุ่มใหญ่ ≥44px สำหรับ tablet)
- **Product grid**: Card-based, ราคา + stock ชัดเจน
- **Cart sidebar**: item list, quantity control, total แบบ realtime
- **Receipt**: Print-friendly, ไม่มี Tailwind background colors

---

## Flow เมื่อ Claude รับ Task

```
ผู้ใช้ส่ง task
      │
      ▼
[โหลด context อัตโนมัติ]
  project CLAUDE.md chain + memory
      │
      ▼
[วิเคราะห์ task]
  เล็ก/ชัดเจน? → ทำเลย
  ใหญ่/ไม่แน่ใจ? → เข้า Plan Mode (/plan)
      │
      ▼
[Plan Mode] (ถ้าจำเป็น)
  1. Explore codebase (spawn Explore agents)
  2. Design approach (spawn Plan agent)
  3. ถามผู้ใช้ถ้ายังไม่ชัด
  4. เขียน plan file → ขอ approve
      │
      ▼
[Implement]
  ตาม SKILL.md conventions:
  - Server Component by default
  - Server Actions สำหรับ form/mutation
  - Zustand สำหรับ client state
  - ไม่แก้ components/ui/ ตรงๆ
  - ใช้ cn() สำหรับ className
      │
      ▼
[Spawn Sub-agents ถ้าเหมาะสม]
  reviewer     → หลังเขียน code ใหม่
  ui-builder   → ถ้า task เน้น UI หนัก
  data-layer   → ถ้า task เน้น state/types
  senior-frontend → ถ้าต้องจัด structure
      │
      ▼
[บันทึก Memory]
  ถ้าเรียนรู้บางอย่างใหม่เกี่ยวกับโปรเจกต์
  หรือผู้ใช้ให้ feedback เกี่ยวกับวิธีทำงาน
      │
      ▼
รายงานผล
```

---

## Rules สำคัญสรุป (จาก .md files)

สิ่งที่ Claude จะทำหรือไม่ทำในโปรเจกต์นี้ — อ่านก่อนส่ง task:

| ทำ | ไม่ทำ |
|----|-------|
| Server Component by default | ใส่ `"use client"` ทุกไฟล์ |
| ดึงข้อมูลใน async Server Components | `useEffect` + `fetch` สำหรับ data |
| Server Actions สำหรับ form/mutation | `/api/` routes สำหรับ DB access |
| Zustand สำหรับ client state เท่านั้น | เก็บ server data ไว้ใน Zustand |
| Wrap shadcn components ถ้าต้อง extend | แก้ไฟล์ใน `components/ui/` ตรงๆ |
| `cn()` สำหรับ conditional className | Template literals สำหรับ className |
| อ่าน `node_modules/next/dist/docs/` ก่อน code | Assume API เหมือน Next.js เวอร์ชันก่อน |
| TypeScript strict, ไม่มี `any` | `as any` หรือ `@ts-ignore` โดยไม่มีเหตุผล |
| Comment เฉพาะ WHY ที่ไม่ obvious | Comment อธิบาย WHAT ที่อ่านรู้อยู่แล้ว |

---

## วิธีเพิ่ม/แก้ Configuration

### แก้ Conventions หรือ Stack

แก้ไขที่ [SKILL.md](SKILL.md) — เช่น เพิ่ม library ใหม่, เปลี่ยน version, เพิ่ม coding rule

### แก้ System Design

แก้ไขที่ [DESIGN.md](DESIGN.md) — เช่น เพิ่ม feature ใหม่, เปลี่ยน data model, เพิ่ม route

### เพิ่ม Specialized Agent

สร้างไฟล์ใหม่ที่ `.claude/agents/<name>.md` ด้วย format:
```markdown
---
name: <name>
description: <อธิบายสั้นๆ ว่าทำอะไร เรียกใช้เมื่อไหร่>
---

คำสั่งและ guidelines สำหรับ agent นี้...
```

### เพิ่ม Permission (ลด prompt ที่รบกวน)

แก้ `.claude/settings.local.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(npm install *)",
      "Bash(pnpm run *)"
    ]
  }
}
```

---

## Memory System

Claude มีระบบ memory ที่เก็บข้อมูลระหว่าง conversation ไว้ที่:
```
~/.claude/projects/<project-path>/memory/
```

**สิ่งที่เก็บ:**
- `user_*.md` — ข้อมูลเกี่ยวกับผู้ใช้ (preferences, expertise)
- `feedback_*.md` — Feedback ที่ผู้ใช้ให้ (ทำแล้ว, ไม่ทำแล้ว)
- `project_*.md` — สถานะโปรเจกต์ (decisions, constraints)

**สิ่งที่ไม่เก็บ:**
- Code patterns — ดูจาก codebase ได้
- Git history — ดูจาก `git log` ได้
- Ephemeral task details

ถ้าต้องการให้ Claude จำบางอย่างข้าม conversation: พูดว่า **"จำไว้ด้วย"** หรือ **"remember"**

---

## คำถามที่พบบ่อย

**Q: Claude อ่าน `DESIGN.md` ทุก conversation ไหม?**
A: ใช่ — `CLAUDE.md` ที่ root `@include` DESIGN.md ทุกครั้ง เพราะฉะนั้น Claude รู้ว่าโปรเจกต์ทำอะไรอยู่เสมอ

**Q: ถ้าแก้ `SKILL.md` ระหว่าง conversation จะมีผลไหม?**
A: จะมีผลใน conversation ถัดไป — context ถูกโหลดตอนเริ่ม conversation เท่านั้น

**Q: Agents ใน `.claude/agents/` ต่างจาก Claude หลักอย่างไร?**
A: Agent แต่ละตัวคือ Claude ที่ถูก "prompt" ให้เล่นบทบาทเฉพาะ มี context จาก agent file + project files แต่ไม่มีประวัติ conversation ก่อนหน้า เหมาะกับ task ที่ต้องการ fresh perspective หรือ parallel work

**Q: ทำไมถึงมี `AGENTS.md` แยกออกมา?**
A: Next.js 16 มีการเปลี่ยนแปลง API จาก version ก่อน Claude อาจ generate code ที่ใช้ API เก่าได้ถ้าไม่เตือน `AGENTS.md` เตือนให้อ่าน `node_modules/next/dist/docs/` ก่อน code ทุกครั้ง

**Q: ถ้า Claude ทำอะไรผิดจะแก้ยังไง?**
A: บอกตรงๆ ในการสนทนา เช่น "อย่าทำแบบนี้เพราะ..." Claude จะจำไว้เป็น feedback memory และไม่ทำซ้ำใน conversation ต่อไป
