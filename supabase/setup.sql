-- =============================================================================
-- POS System Database Setup
-- =============================================================================
-- Run this file in Supabase SQL Editor to setup the complete database
--
-- Order: 1. Tables → 2. Profiles + Trigger → 3. Create Admin (optional)
-- =============================================================================

-- =============================================================================
-- STEP 1: Create Tables
-- =============================================================================

-- Tables
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  is_active boolean not null default true
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  stock int not null default 0,
  category text not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id),
  source text not null check (source in ('staff', 'customer')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Order Items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  price numeric(10,2) not null,
  quantity int not null
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  method text not null check (method in ('cash', 'qr', 'card')),
  amount numeric(10,2) not null,
  change numeric(10,2) not null default 0,
  paid_at timestamptz not null default now()
);

-- =============================================================================
-- STEP 2: Create Profiles Table + Auto-create Trigger
-- =============================================================================

-- Profiles (User Management)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff', 'manager')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table profiles enable row level security;

drop policy if exists "public read profiles" on profiles;
create policy "public read profiles" on profiles for select using (true);

drop policy if exists "admin manage profiles" on profiles;
create policy "admin manage profiles" on profiles for all using (true);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================================================
-- STEP 3: Insert Sample Data (Optional)
-- =============================================================================

-- Sample Tables
insert into tables (number) values (1), (2), (3), (4), (5)
on conflict (number) do nothing;

-- Sample Products
insert into products (name, price, stock, category, is_available) values
  ('กาแฟร้อน', 45.00, 100, 'เครื่องดื่ม', true),
  ('ชาเย็น', 40.00, 100, 'เครื่องดื่ม', true),
  ('โกโก้เย็น', 50.00, 100, 'เครื่องดื่ม', true),
  ('ต้มยำกุ้ง', 120.00, 50, 'ซุป', true),
  ('ต้มข่าไก่', 100.00, 50, 'ซุป', true),
  ('ข้าวผัดกุ้ง', 80.00, 50, 'อาหารจานเดียว', true),
  ('ผัดไทย', 70.00, 50, 'อาหารจานเดียว', true),
  ('ข้าวหมูกระเทียม', 65.00, 50, 'อาหารจานเดียว', true)
on conflict do nothing;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check all tables created
select
  'tables' as table_name, count(*) as row_count from tables
union all
select 'products', count(*) from products
union all
select 'orders', count(*) from orders
union all
select 'order_items', count(*) from order_items
union all
select 'payments', count(*) from payments
union all
select 'profiles', count(*) from profiles;

-- =============================================================================
-- NEXT STEPS
-- =============================================================================
-- 1. ✅ Database setup complete!
-- 2. 📝 Create your first admin user:
--
--    Option A - Use Supabase Dashboard:
--      • Go to Authentication > Users > Invite user
--      • Then run: UPDATE profiles SET role='admin' WHERE email='your-email';
--
--    Option B - Use CLI script:
--      • npm run create-admin:simple admin@example.com password123 "Admin"
--
--    Option C - Run create-admin.sql
--
-- 3. 🚀 Start the app: npm run dev
-- 4. 🔐 Login at: http://localhost:3000/login
-- =============================================================================
