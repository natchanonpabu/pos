# สร้าง Super Admin User

มี 3 วิธีในการสร้าง Super Admin user สำหรับระบบ POS

---

## วิธีที่ 1: ใช้ Script (แนะนำ)

### ต้องมี Service Role Key

1. เพิ่ม `SUPABASE_SERVICE_ROLE_KEY` ใน `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. รัน script แบบ interactive:
   ```bash
   npm run create-admin
   ```

3. หรือรัน script แบบ command line:
   ```bash
   npm run create-admin:simple admin@example.com SecurePassword123 "Super Admin"
   ```

**ข้อดี:**
- สร้างและ verify email อัตโนมัติ
- ไม่ต้องเข้า Supabase Dashboard
- เหมาะสำหรับ automation

---

## วิธีที่ 2: ใช้ Supabase Dashboard (ง่ายที่สุด)

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **Authentication** → **Users** → **Invite user**
4. กรอก Email และส่ง invitation
5. ตรวจสอบอีเมลและตั้งรหัสผ่าน
6. ไปที่ **SQL Editor** และรัน:
   ```sql
   UPDATE profiles 
   SET role = 'admin', is_active = true 
   WHERE email = 'admin@example.com';
   ```

**ข้อดี:**
- ไม่ต้องใช้ Service Role Key
- ปลอดภัย
- เหมาะสำหรับสร้าง admin คนแรก

---

## วิธีที่ 3: ใช้ SQL (สำหรับ Advanced Users)

รัน SQL ใน **Supabase SQL Editor**:

```sql
-- สร้าง auth user พร้อม password
-- Note: ต้องมี pgcrypto extension
-- Supabase มี extension นี้อยู่แล้ว

-- Insert auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_current,
  email_change_token_new
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('YourSecurePassword', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  ''
);

-- Update profile to admin
UPDATE profiles 
SET 
  full_name = 'Super Admin',
  role = 'admin',
  is_active = true
WHERE email = 'admin@example.com';

-- Verify
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE role = 'admin';
```

**คำเตือน:**
- วิธีนี้ซับซ้อนกว่า
- อาจมีปัญหากับ trigger และ RLS
- ใช้เฉพาะเมื่อจำเป็น

---

## วิธีที่ 4: Sign Up แล้วอัพเดท Role

1. เปิด browser ไปที่ `/login`
2. สร้าง account ใหม่ (ถ้ามีหน้า sign up)
3. ตรวจสอบ email verification
4. รัน SQL ใน Supabase:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

**ข้อดี:**
- ไม่ต้องใช้ Service Role Key
- Test flow การสร้าง user ได้ด้วย

---

## ตรวจสอบว่า Admin ถูกสร้างแล้ว

รัน SQL นี้ใน Supabase SQL Editor:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

---

## ทดสอบ Login

1. ไปที่ `http://localhost:3000/login`
2. กรอก Email และ Password ที่สร้างไว้
3. กด "เข้าสู่ระบบ"
4. ควรเข้าสู่หน้า POS Terminal
5. ตรวจสอบว่า sidebar แสดง "ผู้ดูแล" (admin role)
6. ลองเข้าหน้า `/users` ควรเข้าได้

---

## Troubleshooting

### Script error: "Missing SUPABASE_SERVICE_ROLE_KEY"

**วิธีแก้:**
- เพิ่ม Service Role Key ใน `.env.local`
- หรือใช้วิธีที่ 2 (Dashboard) แทน

### Email not confirmed

**วิธีแก้:**
```sql
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@example.com';
```

### Profile not created

**วิธีแก้:**
ตรวจสอบว่า trigger `on_auth_user_created` ทำงาน:
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If not, create it (see supabase/profiles.sql)
```

### Cannot find Service Role Key

**หา Service Role Key:**
1. ไปที่ Supabase Dashboard
2. เลือก Project
3. ไปที่ **Settings** → **API**
4. คัดลอก **service_role** key (ไม่ใช่ anon key!)

---

## ความปลอดภัย

⚠️ **สำคัญมาก:**

1. **ห้าม commit** Service Role Key ลงใน Git
2. **ใช้ .env.local** สำหรับเก็บ keys (ไฟล์นี้ถูก .gitignore อยู่แล้ว)
3. **เปลี่ยนรหัสผ่านเริ่มต้น** หลังสร้าง admin คนแรก
4. **ใช้ strong password** (อย่างน้อย 12 ตัวอักษร, ตัวพิมพ์ใหญ่/เล็ก, ตัวเลข, สัญลักษณ์)

---

## ตัวอย่างการสร้าง Admin หลายคน

```bash
# Admin คนแรก
npm run create-admin:simple admin@company.com SecurePass123! "Admin User"

# Manager
npm run create-admin:simple manager@company.com ManagerPass456! "Manager User"

# แล้วอัพเดท role ใน SQL:
UPDATE profiles SET role = 'manager' WHERE email = 'manager@company.com';
```

---

## เอกสารเพิ่มเติม

- [AUTH.md](../AUTH.md) - เอกสาร Authentication ฉบับเต็ม
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
