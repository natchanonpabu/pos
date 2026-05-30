-- Quick Admin Setup (Copy & Paste this entire block)
-- Replace YOUR_EMAIL and YOUR_PASSWORD before running

-- Reset password + confirm email + set admin role
UPDATE auth.users
SET
  encrypted_password = crypt('YOUR_PASSWORD', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'YOUR_EMAIL';

UPDATE profiles
SET
  role = 'admin',
  is_active = true,
  full_name = 'Super Admin'
WHERE email = 'YOUR_EMAIL';

-- Verify result
SELECT
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name,
  p.is_active
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'YOUR_EMAIL';
