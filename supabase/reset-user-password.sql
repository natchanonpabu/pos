-- =============================================================================
-- Reset User Password (Development/Testing)
-- =============================================================================
-- Use this when you hit email rate limits during development
-- Run in Supabase SQL Editor
-- =============================================================================

-- Option 1: Reset specific user password
-- Replace 'user@example.com' and 'newPassword123'
UPDATE auth.users
SET
  encrypted_password = crypt('newPassword123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'user@example.com';

-- Verify
SELECT id, email, email_confirmed_at, updated_at
FROM auth.users
WHERE email = 'user@example.com';

-- =============================================================================
-- Option 2: Reset and confirm email (if not confirmed)
-- =============================================================================
UPDATE auth.users
SET
  encrypted_password = crypt('newPassword123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'user@example.com';

-- =============================================================================
-- Option 3: Change user role to admin (Super Admin)
-- =============================================================================
-- Update role in profiles table
UPDATE profiles
SET
  role = 'admin',
  is_active = true
WHERE email = 'user@example.com';

-- Verify profile
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE email = 'user@example.com';

-- =============================================================================
-- Option 4: Reset Password + Set Admin Role (All-in-One)
-- =============================================================================
-- Update auth user password
UPDATE auth.users
SET
  encrypted_password = crypt('newPassword123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'user@example.com';

-- Update profile role to admin
UPDATE profiles
SET
  role = 'admin',
  is_active = true,
  full_name = 'Super Admin'
WHERE email = 'user@example.com';

-- Verify both tables
SELECT
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name,
  p.is_active
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'user@example.com';

-- =============================================================================
-- Option 5: Check rate limit status
-- =============================================================================
-- Check auth logs to see rate limit issues
SELECT
  created_at,
  event_type,
  email,
  json_extract_path_text(data, 'message') as message
FROM auth.audit_log_entries
WHERE event_type IN ('user_recovery_requested', 'rate_limit_exceeded')
ORDER BY created_at DESC
LIMIT 10;

-- =============================================================================
-- Quick Reference
-- =============================================================================
-- After running SQL above:
-- 1. Go to /login
-- 2. Login with:
--    Email: user@example.com
--    Password: newPassword123
-- 3. Change password in app if needed
