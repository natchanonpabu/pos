# Troubleshooting Guide

## 🐛 Authentication Issues

### Email Rate Limit Exceeded

**Error Message:**
```
Failed to send password recovery: email rate limit exceeded
```

**สาเหตุ:**
- Supabase จำกัดจำนวนอีเมลที่ส่งได้ต่อชั่วโมง
- ส่งอีเมลบ่อยเกินไประหว่าง development/testing

**วิธีแก้:**

#### Option 1: รอ Rate Limit หมดอายุ
```
รอ 1 ชั่วโมง แล้วลองใหม่
```

#### Option 2: Reset Password ด้วย SQL (แนะนำ!)

1. เปิด Supabase SQL Editor
2. Copy SQL จาก `supabase/reset-user-password.sql`
3. แก้ไข email และ password ที่ต้องการ
4. รัน SQL:
   ```sql
   UPDATE auth.users
   SET 
     encrypted_password = crypt('newPassword123', gen_salt('bf')),
     email_confirmed_at = now(),
     updated_at = now()
   WHERE email = 'your-email@example.com';
   ```
5. Login ด้วยรหัสผ่านใหม่

#### Option 3: ใช้ Supabase Dashboard

1. Dashboard → Authentication → Users
2. เลือก user ที่ต้องการ
3. คลิก **Actions** → **Edit User**
4. ตั้งรหัสผ่านใหม่ (ถ้ามี option)
5. หรือ **Send password reset email** (ถ้า rate limit หมดแล้ว)

#### Option 4: เพิ่ม Rate Limit (Production)

สำหรับ production, ติดต่อ Supabase support เพื่อเพิ่ม rate limit หรือใช้ SMTP provider ของตัวเอง

---

### Cannot Login After Password Reset

**สาเหตุ:**
- Token หมดอายุ (> 1 ชั่วโมง)
- Session ไม่ถูกต้อง
- รหัสผ่านไม่ update

**วิธีแก้:**

1. **Clear browser cookies:**
   ```
   Chrome: Settings → Privacy → Clear browsing data → Cookies
   ```

2. **ตรวจสอบว่ารหัสผ่านถูก update:**
   ```sql
   SELECT 
     email, 
     updated_at,
     email_confirmed_at
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

3. **Reset password ด้วย SQL:**
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('newPassword', gen_salt('bf'))
   WHERE email = 'your-email@example.com';
   ```

---

### Email Not Received

**เช็คที่ Supabase:**

1. **Dashboard → Authentication → Logs**
   - ดู errors related to email sending
   - ดูว่า email ถูกส่งจริงหรือไม่

2. **Dashboard → Authentication → Email Templates**
   - ตรวจสอบว่า template ถูกต้อง
   - มี `{{ .ConfirmationURL }}`

**Solutions:**

1. ตรวจสอบ spam/junk folder
2. ใช้ email address อื่น (Gmail, Outlook)
3. รอ 1-2 นาที (อาจส่งช้า)
4. ตรวจสอบ Email provider settings
5. ใช้ SQL reset แทน (วิธีที่เร็วที่สุด)

---

### Middleware Redirect Loop

**Error:**
```
Too many redirects
```

**วิธีแก้:**

1. **Clear cookies:**
   ```javascript
   // In browser console
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "")
       .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

2. **ตรวจสอบ middleware.ts:**
   ```typescript
   // ต้องมี /login ใน PUBLIC_ROUTES
   const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']
   ```

3. **Restart dev server:**
   ```bash
   # Kill process
   lsof -ti:3000 | xargs kill -9
   
   # Start again
   npm run dev
   ```

---

## 🗄️ Database Issues

### Table Does Not Exist

**Error:**
```
relation "profiles" does not exist
```

**วิธีแก้:**

รัน database setup:
```sql
-- Copy จาก supabase/setup.sql
-- Paste ใน Supabase SQL Editor
-- Run
```

หรือรันทีละไฟล์:
```sql
\i supabase/schema.sql
\i supabase/profiles.sql
```

---

### Trigger Not Working

**ปัญหา:** User สร้างแล้ว แต่ไม่มี profile

**ตรวจสอบ trigger:**
```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

**สร้างใหม่:**
```sql
-- Drop old trigger/function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create new (from supabase/profiles.sql)
CREATE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

## 📦 Build Issues

### Module Not Found

**Error:**
```
Module not found: Can't resolve '@/...'
```

**วิธีแก้:**

1. **ตรวจสอบ import path:**
   ```typescript
   // ✅ Correct
   import { Button } from '@/components/ui/button'
   
   // ❌ Wrong
   import { Button } from '../../../components/ui/button'
   ```

2. **Clean and reinstall:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

---

### TypeScript Errors

**Error:**
```
Type 'X' is not assignable to type 'Y'
```

**วิธีแก้:**

1. **ตรวจสอบ types:**
   ```bash
   npx tsc --noEmit
   ```

2. **Update types:**
   ```typescript
   // เพิ่ม type annotation
   const user: User | null = await getCurrentUser()
   ```

3. **Restart TS server (VS Code):**
   ```
   Cmd+Shift+P → TypeScript: Restart TS Server
   ```

---

## 🚀 Production Issues

### Environment Variables Not Working

**ปัญหา:** ตัวแปรไม่โหลดใน production

**วิธีแก้:**

1. **Vercel/Netlify:**
   - ตั้งค่า environment variables ใน dashboard
   - Redeploy

2. **Self-hosted:**
   ```bash
   # Load .env.production
   export $(cat .env.production | xargs)
   npm run build
   npm start
   ```

---

### CORS Errors

**Error:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**วิธีแก้:**

1. **ตั้งค่า Supabase:**
   - Dashboard → Settings → API
   - เพิ่ม domain ใน **Allowed Origins**

2. **Next.js config:**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             { key: 'Access-Control-Allow-Origin', value: '*' },
           ],
         },
       ]
     },
   }
   ```

---

## 🔍 Debug Tips

### Check Supabase Connection

```typescript
// In browser console or server
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data)
console.log('Error:', error)
```

### Check Environment Variables

```bash
# List all env vars
printenv | grep NEXT_PUBLIC

# Or in code
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10) + '...')
```

### Check Database Connection

```sql
-- In Supabase SQL Editor
SELECT version();
SELECT current_database();
SELECT count(*) FROM profiles;
```

---

## 📞 Getting Help

1. **Check Logs:**
   - Supabase: Dashboard → Logs
   - Browser: DevTools → Console
   - Server: Terminal output

2. **Documentation:**
   - `/docs` folder
   - Supabase Docs: https://supabase.com/docs
   - Next.js Docs: https://nextjs.org/docs

3. **Community:**
   - Supabase Discord
   - Next.js Discord
   - Stack Overflow

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Auth Logs](https://supabase.com/dashboard/project/_/auth/logs)
- [Email Templates](https://supabase.com/dashboard/project/_/auth/templates)
- [API Settings](https://supabase.com/dashboard/project/_/settings/api)
