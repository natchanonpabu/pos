# Database Setup Guide

## 🗄️ ตั้งค่า Database สำหรับ POS System

### Quick Setup (วิธีง่ายที่สุด)

1. **เปิด Supabase SQL Editor:**
   - ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
   - เลือก Project ของคุณ
   - คลิก **SQL Editor** (ทางซ้าย)

2. **Copy และ Paste SQL:**
   - เปิดไฟล์ `supabase/setup.sql`
   - Copy ทั้งหมด
   - Paste ลงใน SQL Editor
   - คลิก **Run** หรือกด `Ctrl+Enter`

3. **รอให้เสร็จ:**
   ```
   ✅ tables created (5 rows)
   ✅ products created (8 rows)
   ✅ profiles created
   ✅ triggers created
   ```

4. **ตรวจสอบ:**
   - ไปที่ **Table Editor**
   - ควรเห็น tables: `tables`, `products`, `orders`, `order_items`, `payments`, `profiles`

---

## 📋 SQL Files Overview

| File | Purpose | Order |
|------|---------|-------|
| `setup.sql` | 🚀 **Run this first** - Complete setup in one file | 1 |
| `schema.sql` | Core tables (tables, products, orders, payments) | - |
| `profiles.sql` | User profiles + auth trigger | - |
| `create-admin.sql` | Create admin user (run after setup) | 2 |

**💡 Tip:** `setup.sql` รวม `schema.sql` + `profiles.sql` ไว้แล้ว ไม่ต้องรันแยก!

---

## 🔧 Step-by-Step Setup

### Step 1: Run Database Setup

```sql
-- Copy และ Paste จาก supabase/setup.sql
-- หรือรันทีละไฟล์:

-- 1. Core tables
\i supabase/schema.sql

-- 2. User profiles + trigger
\i supabase/profiles.sql
```

### Step 2: Verify Tables Created

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected output:
-- tables
-- products
-- orders
-- order_items
-- payments
-- profiles
```

### Step 3: Check Sample Data

```sql
-- Check products
SELECT id, name, price, category FROM products;

-- Check tables
SELECT id, number, is_active FROM tables;
```

### Step 4: Create Admin User

ดู [CREATE_ADMIN.md](CREATE_ADMIN.md) สำหรับคำแนะนำละเอียด

**Quick version:**

```sql
-- After user signs up, update role to admin
UPDATE profiles 
SET role = 'admin', is_active = true 
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, full_name, role FROM profiles WHERE role = 'admin';
```

---

## 🔄 Database Schema

### Core Tables

**tables** - โต๊ะในร้าน
```sql
id          uuid
number      int (unique)
is_active   boolean
```

**products** - สินค้า
```sql
id            uuid
name          text
price         numeric
stock         int
category      text
image_url     text
is_available  boolean
created_at    timestamptz
```

**orders** - ออเดอร์
```sql
id          uuid
table_id    uuid (nullable)
source      'staff' | 'customer'
subtotal    numeric
discount    numeric
total       numeric
status      'pending' | 'confirmed' | 'paid' | 'cancelled'
created_at  timestamptz
```

**order_items** - รายการสินค้าในออเดอร์
```sql
id          uuid
order_id    uuid
product_id  uuid
name        text
price       numeric
quantity    int
```

**payments** - การชำระเงิน
```sql
id        uuid
order_id  uuid
method    'cash' | 'qr' | 'card'
amount    numeric
change    numeric
paid_at   timestamptz
```

**profiles** - ข้อมูล users
```sql
id          uuid (references auth.users)
email       text
full_name   text
role        'admin' | 'manager' | 'staff'
avatar_url  text
is_active   boolean
created_at  timestamptz
```

---

## 🔐 Row Level Security (RLS)

**profiles table:**
```sql
-- Read: ทุกคนอ่านได้
CREATE POLICY "public read profiles" 
ON profiles FOR SELECT USING (true);

-- Manage: ให้ admin จัดการ
CREATE POLICY "admin manage profiles" 
ON profiles FOR ALL USING (true);
```

**Note:** RLS policies สำหรับ tables อื่นจะเพิ่มในภายหลัง

---

## 🔥 Auto-create Profile Trigger

เมื่อมี user ใหม่ sign up → สร้าง profile อัตโนมัติ

```sql
CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

## 🧪 Testing

### Test 1: Check Tables

```sql
-- Should return 6 tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tables', 'products', 'orders', 'order_items', 'payments', 'profiles');
```

### Test 2: Check Sample Data

```sql
-- Should return 5 tables
SELECT COUNT(*) FROM tables;

-- Should return 8 products
SELECT COUNT(*) FROM products;
```

### Test 3: Check Trigger

```sql
-- Check trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🔄 Reset Database (Development Only)

**⚠️ WARNING: This will delete ALL data!**

```sql
-- Drop all tables
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Then run setup.sql again
```

---

## 🐛 Troubleshooting

### Error: "relation profiles does not exist"

**Solution:** รัน `supabase/setup.sql` ใน SQL Editor

### Error: "trigger already exists"

**Solution:** trigger มีอยู่แล้ว, ไม่ต้องกังวล

### Sample data not inserted

**Solution:** ลองรัน INSERT statements อีกครั้ง (มี `ON CONFLICT DO NOTHING`)

### RLS policy error

**Solution:**
```sql
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or recreate policies
DROP POLICY IF EXISTS "public read profiles" ON profiles;
CREATE POLICY "public read profiles" ON profiles FOR SELECT USING (true);
```

---

## 📖 Next Steps

1. ✅ Database setup เสร็จแล้ว
2. 📝 สร้าง admin user: [CREATE_ADMIN.md](CREATE_ADMIN.md)
3. 🚀 รันแอป: `npm run dev`
4. 🔐 Login: `http://localhost:3000/login`

---

## 📚 Additional Resources

- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase SQL Editor Guide](https://supabase.com/docs/guides/database/sql-editor)
