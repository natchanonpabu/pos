# Authentication System

## Overview

ระบบ authentication ของ POS app ใช้ Supabase Auth พร้อม middleware สำหรับ protected routes

---

## Architecture

```
middleware.ts                 → Route protection (redirect ถ้าไม่ login)
lib/auth.ts                   → Server-side auth utilities
hooks/useAuth.ts              → Client-side auth hook
components/providers/         → AuthProvider (context)
actions/auth.ts               → Server Actions (signIn, signOut)
```

---

## Protected Routes

**Middleware** (`middleware.ts`) จัดการ:
- ตรวจสอบ session ทุก request
- Redirect ไป `/login` ถ้าไม่ login
- Redirect ไป `/` ถ้า login แล้วพยายามเข้า `/login`
- เก็บ `?next=` parameter สำหรับ redirect หลัง login

**Public routes:**
- `/login`
- `/forgot-password`
- `/reset-password`

**Protected routes:**
- `/` (POS Terminal)
- `/products`
- `/orders`
- `/reports`
- `/users` (admin + manager only)

---

## Server-Side Auth

ใช้ `lib/auth.ts`:

```typescript
// Get current user
const user = await getCurrentUser()

// Require authentication
const user = await requireAuth()

// Require specific roles
const user = await requireRole(['admin', 'manager'])
```

**ตัวอย่าง:**
```typescript
// app/(pos)/users/page.tsx
export default async function UsersPage() {
  await requireRole(['admin', 'manager'])
  const users = await userService.getAll()
  return <UsersTemplate users={users} />
}
```

---

## Client-Side Auth

### 1. useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <Loader />
  if (!user) return null

  return <div>Hello {user.fullName}</div>
}
```

### 2. AuthProvider Context

```typescript
import { useAuthContext } from '@/components/providers'

function MyComponent() {
  const { user, loading, signOut } = useAuthContext()
  // ...
}
```

### 3. ProtectedRoute Component

```typescript
import { ProtectedRoute } from '@/components/auth'

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  )
}
```

---

## Server Actions

### Login

```typescript
import { signIn } from '@/actions/auth'

const formData = new FormData()
formData.append('email', 'user@example.com')
formData.append('password', 'password')

const result = await signIn(formData)
if (result.success) {
  window.location.href = '/'
}
```

### Logout

```typescript
import { signOut } from '@/actions/auth'

await signOut() // auto redirect to /login
```

### Password Reset

```typescript
import { requestPasswordReset, resetPassword } from '@/actions/auth'

// Request reset (send email)
const formData = new FormData()
formData.append('email', 'user@example.com')
const result = await requestPasswordReset(formData)

// Reset password (from email link)
const resetData = new FormData()
resetData.append('password', 'newPassword123')
resetData.append('confirmPassword', 'newPassword123')
const resetResult = await resetPassword(resetData)
```

📖 [Password Reset Guide →](docs/PASSWORD_RESET.md)

---

## User Management

**สร้าง User:**
```typescript
import { createUser } from '@/actions/users'

const formData = new FormData()
formData.append('email', 'new@example.com')
formData.append('fullName', 'New User')
formData.append('role', 'staff')
formData.append('password', 'password')

const result = await createUser(formData)
```

**แก้ไข User:**
```typescript
import { updateUser } from '@/actions/users'

const formData = new FormData()
formData.append('fullName', 'Updated Name')
formData.append('role', 'manager')

const result = await updateUser(userId, formData)
```

**ลบ User:**
```typescript
import { deleteUser } from '@/actions/users'

const result = await deleteUser(userId)
```

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | ผู้ดูแลระบบ | เข้าถึงได้ทุกหน้า รวมถึงจัดการ users |
| `manager` | ผู้จัดการ | เข้าถึงได้ทุกหน้า (อาจมีข้อจำกัดบางส่วน) |
| `staff` | พนักงาน | เข้าถึงหน้า POS, products, orders |

---

## Database Schema

```sql
-- profiles table (see supabase/profiles.sql)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff', 'manager')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Auto-create profile trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Session Management

- Supabase จัดการ session cookies อัตโนมัติ
- Middleware ตรวจสอบ session ทุก request
- Client hooks subscribe auth state changes real-time
- Session timeout ตาม Supabase settings (default: 1 hour)

---

## Security Notes

1. **Never use `SUPABASE_SERVICE_ROLE_KEY` ใน client code**
2. ใช้ Row Level Security (RLS) ใน Supabase
3. Validate input ใน Server Actions เสมอ
4. ใช้ `requireRole()` สำหรับ sensitive routes
5. Disable inactive users แทนการลบ (soft delete)

---

## Testing

### สร้าง admin user แรก:

**วิธีที่ 1: ใช้ Script (แนะนำ)**

```bash
# แบบ interactive
npm run create-admin

# แบบ command line
npm run create-admin:simple admin@example.com SecurePassword123 "Super Admin"
```

**วิธีที่ 2: Supabase Dashboard**

1. Dashboard → Authentication → Users → Invite user
2. ตั้งรหัสผ่านจาก email
3. Update role manually ใน SQL Editor:
   ```sql
   UPDATE profiles 
   SET role = 'admin', is_active = true 
   WHERE email = 'admin@example.com';
   ```

**วิธีที่ 3: SQL ใน Supabase Editor**

```sql
-- Insert auth user with password
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('YourSecurePassword', gen_salt('bf')),
  now(), now(), now()
);

-- Update profile role
UPDATE profiles 
SET role = 'admin', is_active = true 
WHERE email = 'admin@example.com';
```

📖 [คู่มือสร้าง Admin ฉบับเต็ม →](docs/CREATE_ADMIN.md)

---

## Troubleshooting

**ปัญหา: Infinite redirect loop**
- ตรวจสอบว่า middleware config ถูกต้อง
- ตรวจสอบว่า `/login` อยู่ใน PUBLIC_ROUTES

**ปัญหา: Session หาย after refresh**
- ตรวจสอบว่าใช้ `@supabase/ssr` แทน `@supabase/supabase-js`
- ตรวจสอบว่า cookies ทำงานใน middleware

**ปัญหา: TypeError: cookies is not a function**
- ใช้ `await cookies()` ใน Server Actions
- ใช้ `createServerClient` ด้วย SSR config

---

## Future Enhancements

- [ ] Email verification
- [x] Password reset (via email)
- [ ] Change password (while logged in)
- [ ] 2FA (Two-factor authentication)
- [ ] Remember me checkbox
- [ ] Session timeout warning
- [ ] Activity logging
- [ ] Password strength requirements
