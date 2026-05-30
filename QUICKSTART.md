# Quick Start Guide

## 🚀 เริ่มต้นใช้งาน POS System

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: สำหรับสร้าง admin user
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Setup Database

**วิธีเร็ว (แนะนำ):**

1. เปิด [Supabase SQL Editor](https://supabase.com/dashboard)
2. Copy ทั้งหมดจาก `supabase/setup.sql`
3. Paste และ Run

**หรือรันทีละไฟล์:**

```bash
supabase/schema.sql       # Core tables
supabase/profiles.sql     # User profiles + trigger
```

📖 [คู่มือ Database Setup แบบละเอียด →](docs/DATABASE_SETUP.md)

### 4. สร้าง Super Admin User

**วิธีที่ 1: ใช้ Script (ถ้ามี Service Role Key)**

```bash
npm run create-admin:simple admin@example.com SecurePassword123 "Super Admin"
```

**วิธีที่ 2: ใช้ Supabase Dashboard**

1. Dashboard → Authentication → Users → Invite user
2. ตั้งค่า email และรหัสผ่าน
3. รัน SQL:
   ```sql
   UPDATE profiles 
   SET role = 'admin', is_active = true 
   WHERE email = 'your-email@example.com';
   ```

📖 [คู่มือสร้าง Admin แบบละเอียด →](docs/CREATE_ADMIN.md)

### 5. เริ่มต้น Dev Server

```bash
npm run dev
```

เปิด browser: `http://localhost:3000`

### 6. Login

- ไปที่ `/login`
- กรอก email และ password ของ admin
- เข้าสู่ระบบ

---

## 📁 โครงสร้างโปรเจค

```
pos/
├── app/                      # Next.js App Router
│   ├── (pos)/               # Staff routes (protected)
│   │   ├── page.tsx         # POS Terminal
│   │   ├── products/        # Products management
│   │   ├── orders/          # Orders history
│   │   ├── reports/         # Sales reports
│   │   └── users/           # Users management (admin only)
│   ├── login/               # Login page
│   └── table/               # Customer ordering
├── components/
│   ├── feature/             # Feature components (Atomic Design)
│   ├── ui/                  # shadcn/ui components
│   ├── providers/           # Context providers
│   └── auth/                # Auth components
├── actions/                 # Server Actions
├── services/                # Service layer (DB queries)
├── lib/                     # Utilities
├── hooks/                   # Custom hooks
├── store/                   # Zustand stores
├── types/                   # TypeScript types
└── supabase/                # Database schemas
```

---

## 🎯 Features ที่พร้อมใช้งาน

- ✅ Authentication & Authorization
- ✅ User Management (admin/manager/staff roles)
- ✅ Protected Routes
- ✅ Real-time subscriptions
- ⏳ POS Terminal (in progress)
- ⏳ Product Management (in progress)
- ⏳ Order Management (in progress)
- ⏳ Reports (in progress)

---

## 🔑 User Roles

| Role | Access |
|------|--------|
| **admin** | ทุกหน้า + จัดการ users |
| **manager** | ทุกหน้า + จัดการ users |
| **staff** | POS, products, orders, reports |

---

## 📚 เอกสารเพิ่มเติม

- [DESIGN.md](DESIGN.md) - System Design & Architecture
- [SKILL.md](SKILL.md) - Tech Stack & Conventions
- [AUTH.md](AUTH.md) - Authentication System
- [docs/CREATE_ADMIN.md](docs/CREATE_ADMIN.md) - Create Admin User Guide

---

## 🛠️ Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Admin Management
npm run create-admin     # Create admin (interactive)
npm run create-admin:simple <email> <password> <name>  # Create admin (CLI)

# Code Quality
npm run lint             # Run ESLint
```

---

## 🐛 Troubleshooting

### Cannot login

1. ตรวจสอบว่า Supabase credentials ถูกต้อง
2. ตรวจสอบว่า user มีใน `profiles` table
3. ตรวจสอบว่า `is_active = true`

### Redirect loop

1. ตรวจสอบ middleware.ts
2. Clear browser cookies
3. ตรวจสอบว่า `/login` อยู่ใน PUBLIC_ROUTES

### Build errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 💡 Tips

1. **Development:** ใช้ `npm run dev -- --turbo` สำหรับ Turbopack
2. **Security:** อย่า commit `.env.local` ลง git
3. **Testing:** สร้าง test users ด้วย different roles
4. **Database:** Backup ก่อน run migrations

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📧 Support

หากมีปัญหาหรือคำถาม:
- เปิด Issue ใน GitHub
- อ่านเอกสารใน `/docs`
- ตรวจสอบ console logs

---

**Happy Coding! 🎉**
