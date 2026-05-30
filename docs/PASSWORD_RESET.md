# Password Reset Feature

## 🔐 ฟีเจอร์รีเซ็ตรหัสผ่าน

ระบบ POS มีฟีเจอร์รีเซ็ตรหัสผ่านผ่านอีเมล

---

## 📋 Overview

**Flow:**
1. User คลิก "ลืมรหัสผ่าน?" ในหน้า login
2. กรอก email → ส่งลิงก์รีเซ็ตรหัสผ่าน
3. ตรวจสอบอีเมล → คลิกลิงก์
4. ตั้งรหัสผ่านใหม่
5. Redirect ไปหน้า login อัตโนมัติ

**Pages:**
- `/login` - มีลิงก์ "ลืมรหัสผ่าน?"
- `/forgot-password` - ส่งลิงก์รีเซ็ตรหัสผ่าน
- `/reset-password` - ตั้งรหัสผ่านใหม่

---

## ⚙️ Supabase Configuration

### Step 1: Enable Email Auth

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project
3. **Authentication** → **Providers**
4. Enable **Email** provider
5. ตั้งค่า:
   ```
   ✓ Enable Email provider
   ✓ Confirm email (optional - แนะนำให้เปิด)
   ✓ Secure password change
   ```

### Step 2: Configure Email Templates

1. **Authentication** → **Email Templates**
2. เลือก **Reset Password**

**Template แนะนำ:**

```html
<h2>รีเซ็ตรหัสผ่าน</h2>

<p>สวัสดี,</p>

<p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี Chompoo POS</p>

<p>
  <a href="{{ .ConfirmationURL }}">คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน</a>
</p>

<p>หรือคัดลอกลิงก์นี้ไปที่เบราว์เซอร์:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>

<p>ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้เพิกเฉยอีเมลนี้</p>

<hr />

<p style="font-size: 12px; color: #999;">
  อีเมลนี้ถูกส่งโดย Chompoo POS System
</p>
```

**Variables ที่ใช้ได้:**
- `{{ .ConfirmationURL }}` - ลิงก์รีเซ็ตรหัสผ่าน
- `{{ .Token }}` - Token สำหรับ verify
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Base URL ของแอป

### Step 3: Configure Site URL

1. **Authentication** → **URL Configuration**
2. ตั้งค่า **Site URL:**
   ```
   Development: http://localhost:3000
   Production: https://your-domain.com
   ```

3. ตั้งค่า **Redirect URLs:**
   ```
   http://localhost:3000/**
   https://your-domain.com/**
   ```

### Step 4: Environment Variables

เพิ่มใน `.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For password reset redirect
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🧪 Testing

### Test Password Reset Flow

**1. Request Reset:**
```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/login

# Click "ลืมรหัสผ่าน?"
# Enter email: admin@example.com
# Click "ส่งลิงก์รีเซ็ตรหัสผ่าน"
```

**2. Check Email:**
- ตรวจสอบ inbox (หรือ spam folder)
- คลิกลิงก์ในอีเมล
- ควร redirect ไป `/reset-password`

**3. Reset Password:**
- กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
- กรอกยืนยันรหัสผ่าน
- คลิก "รีเซ็ตรหัสผ่าน"
- ควรเห็น "รีเซ็ตรหัสผ่านสำเร็จ!"
- Redirect ไป `/login` อัตโนมัติ

**4. Login with New Password:**
- ใช้รหัสผ่านใหม่ login
- ควร login สำเร็จ

---

## 🔧 Server Actions

### Request Password Reset

```typescript
import { requestPasswordReset } from '@/actions/auth'

const formData = new FormData()
formData.append('email', 'user@example.com')

const result = await requestPasswordReset(formData)
if (result.success) {
  console.log('Email sent!')
}
```

### Reset Password

```typescript
import { resetPassword } from '@/actions/auth'

const formData = new FormData()
formData.append('password', 'newPassword123')
formData.append('confirmPassword', 'newPassword123')

const result = await resetPassword(formData)
if (result.success) {
  console.log('Password reset!')
}
```

---

## 🎨 Components

**Pages:**
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`

**Templates:**
- `components/feature/auth/template/forgot-password-template.tsx`
- `components/feature/auth/template/reset-password-template.tsx`

**Forms:**
- `components/feature/auth/molecules/forgot-password-form.tsx`
- `components/feature/auth/molecules/reset-password-form.tsx`

**Actions:**
- `actions/auth.ts` - `requestPasswordReset()`, `resetPassword()`

---

## 🛡️ Security Features

1. **Token Expiration:** ลิงก์หมดอายุใน 1 ชั่วโมง
2. **One-time Use:** Token ใช้ได้ครั้งเดียว
3. **Password Validation:** ต้องมีอย่างน้อย 6 ตัวอักษร
4. **Confirm Password:** ต้องกรอกยืนยันรหัสผ่าน
5. **Rate Limiting:** Supabase จำกัดจำนวนครั้งที่ส่งอีเมล

---

## 🐛 Troubleshooting

### Email Rate Limit Exceeded ⚠️

**Error:**
```
email rate limit exceeded
```

**สาเหตุ:**
Supabase จำกัดจำนวนอีเมลที่ส่งได้ในช่วงเวลาสั้นๆ

**วิธีแก้ (Development):**

**Option 1: รอ Rate Limit หมดอายุ**
```
รอประมาณ 1 ชั่วโมง แล้วลองใหม่
```

**Option 2: Reset Password ด้วย SQL (แนะนำ!)**
```sql
-- Run in Supabase SQL Editor
UPDATE auth.users
SET 
  encrypted_password = crypt('newPassword123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'your-email@example.com';
```

ดูไฟล์: `supabase/reset-user-password.sql`

**Option 3: Supabase Dashboard**
1. Dashboard → Authentication → Users
2. เลือก user → Edit
3. ตั้งรหัสผ่านใหม่

**Production Solution:**
- Setup SMTP provider ของคุณเอง (SendGrid, Mailgun, AWS SES)
- หรือติดต่อ Supabase เพื่อเพิ่ม rate limit

### ไม่ได้รับอีเมล

**เช็คที่ Supabase Dashboard:**
1. **Authentication** → **Logs**
2. ดู errors: `rate_limit_exceeded`, `email_send_failed`

**Solutions:**
- ตรวจสอบ spam/junk folder
- รอ 1-2 นาที
- ใช้ SQL reset แทน (เร็วกว่า!)
- Setup SMTP provider ของคุณเอง

### ลิงก์หมดอายุ

**Error:** "Token expired" or "Invalid token"

**Solutions:**
- ขอลิงก์ใหม่ที่ `/forgot-password`
- ตรวจสอบว่าคลิกลิงก์ภายใน 1 ชั่วโมง
- ตรวจสอบว่า URL ถูกต้อง (ไม่ถูกตัดหรือแก้ไข)

### Redirect ไม่ทำงาน

**เช็ค:**
1. `NEXT_PUBLIC_APP_URL` ตั้งค่าถูกต้อง
2. Redirect URLs ใน Supabase settings ถูกต้อง
3. ไม่มี typo ใน URL

**Solutions:**
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Password ไม่ update

**เช็ค:**
- ตรวจสอบว่ามี session อยู่ (ต้องคลิกลิงก์จากอีเมล)
- ตรวจสอบว่ารหัสผ่านตรงกัน
- ตรวจสอบว่ารหัสผ่านมีอย่างน้อย 6 ตัวอักษร

**Debug:**
```typescript
// Check if user has session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

---

## 📧 Email Provider (Production)

สำหรับ production แนะนำใช้ SMTP provider:

**Options:**
1. **SendGrid** - Free tier: 100 emails/day
2. **Mailgun** - Free tier: 1000 emails/month  
3. **AWS SES** - Pay as you go
4. **Resend** - Free tier: 100 emails/day

**Setup in Supabase:**
1. **Project Settings** → **Auth**
2. **SMTP Settings**
3. กรอก SMTP credentials จาก provider

---

## 🔄 Alternative: Admin Reset Password

Admin สามารถรีเซ็ตรหัสผ่าน user ได้โดยตรง:

```sql
-- ใน Supabase SQL Editor
UPDATE auth.users
SET encrypted_password = crypt('newPassword', gen_salt('bf'))
WHERE email = 'user@example.com';
```

**หรือใช้ Dashboard:**
1. **Authentication** → **Users**
2. เลือก user
3. คลิก **Send password reset email**

---

## 📖 Additional Resources

- [Supabase Auth - Password Reset](https://supabase.com/docs/guides/auth/passwords#reset-password)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)

---

## ✅ Checklist

Setup:
- [ ] Enable Email provider ใน Supabase
- [ ] Customize email template
- [ ] ตั้งค่า Site URL และ Redirect URLs
- [ ] เพิ่ม `NEXT_PUBLIC_APP_URL` ใน `.env.local`

Testing:
- [ ] ทดสอบส่งอีเมล
- [ ] ทดสอบคลิกลิงก์
- [ ] ทดสอบรีเซ็ตรหัสผ่าน
- [ ] ทดสอบ login ด้วยรหัสผ่านใหม่

Production:
- [ ] ตั้งค่า SMTP provider
- [ ] อัพเดท `NEXT_PUBLIC_APP_URL` เป็น production URL
- [ ] ทดสอบ end-to-end flow
