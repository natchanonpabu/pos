-- Tables (โต๊ะ)
create table tables (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique,
  is_active boolean not null default true
);

-- Products (สินค้า/เมนู)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  category text not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders (คำสั่งซื้อ)
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references tables(id) on delete set null,
  source text not null check (source in ('staff', 'customer')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Order Items (รายการในคำสั่งซื้อ)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  price numeric(10,2) not null,
  quantity integer not null check (quantity > 0)
);

-- Payments (การชำระเงิน)
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  method text not null check (method in ('cash', 'qr', 'card')),
  amount numeric(10,2) not null,
  change numeric(10,2) not null default 0,
  paid_at timestamptz not null default now()
);

-- Realtime: เปิดให้ POS subscribe การเปลี่ยนแปลงของ orders
alter table orders enable row level security;
alter table products enable row level security;
alter table tables enable row level security;

-- Policy: อ่านได้ทุกคน (ปรับเพิ่ม auth ทีหลัง)
create policy "public read orders" on orders for select using (true);
create policy "public insert orders" on orders for insert with check (true);
create policy "public update orders" on orders for update using (true);

create policy "public read products" on products for select using (true);

create policy "public read tables" on tables for select using (true);

-- ข้อมูลตัวอย่าง
insert into tables (number) values (1), (2), (3), (4), (5);

insert into products (name, price, stock, category, is_available) values
  ('ผัดไทยกุ้งสด', 120, 100, 'อาหารจานเดียว', true),
  ('ต้มยำกุ้ง', 150, 100, 'ซุป', true),
  ('ข้าวผัดกะเพราหมูกรอบ', 90, 100, 'อาหารจานเดียว', true),
  ('น้ำมะนาว', 40, 100, 'เครื่องดื่ม', true),
  ('น้ำเปล่า', 20, 100, 'เครื่องดื่ม', true);
