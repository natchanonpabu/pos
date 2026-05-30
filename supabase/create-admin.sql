-- Create Super Admin User
-- Run this in Supabase SQL Editor

-- Step 1: Create auth user (ปรับ email และ password ตามต้องการ)
-- Note: ใช้ Supabase Dashboard > Authentication > Users > Invite user แทน
-- หรือใช้ signup API แล้วค่อยอัพเดท role

-- Step 2: Update existing user to admin
-- แทนที่ 'admin@example.com' ด้วย email ที่ต้องการ
UPDATE profiles
SET
  role = 'admin',
  is_active = true,
  full_name = 'Super Admin'
WHERE email = 'admin@example.com';

-- Step 3: Verify
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE role = 'admin';

-- Alternative: หากต้องการสร้างผ่าน SQL (ต้องมี service_role key)
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@example.com',
--   crypt('your-secure-password', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- );
