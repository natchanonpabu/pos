create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff', 'manager')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
create policy "public read profiles" on profiles for select using (true);
create policy "admin manage profiles" on profiles for all using (true);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Insert default admin
-- (run manually after first signup)
