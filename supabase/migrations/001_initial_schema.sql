-- ============================================================
-- Migration 001: Initial schema — profiles, properties, RLS
-- ============================================================

-- ----------------------------------------------------------------
-- profiles table
-- ----------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user'
                check (role in ('user', 'agent', 'admin')),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- properties table
-- ----------------------------------------------------------------
create table if not exists properties (
  id                uuid primary key default gen_random_uuid(),
  agent_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  description       text,
  price             numeric(12,2) not null,
  address           text not null,
  bedrooms          integer not null,
  bathrooms         integer not null,
  sqft              integer not null,
  images            text[] not null default '{}',
  status            text not null default 'available'
                      check (status in ('available', 'pending', 'sold', 'archived')),
  moderation_status text not null default 'pending'
                      check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- Trigger: auto-create profile row on new auth.users insert
-- ----------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    null,
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ----------------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------------
alter table profiles   enable row level security;
alter table properties enable row level security;

-- ----------------------------------------------------------------
-- RLS policies — profiles
-- ----------------------------------------------------------------

-- Users can read their own profile row
create policy "profiles_select_own" on profiles
  for select
  using (auth.uid() = id);

-- Users can update their own profile row
create policy "profiles_update_own" on profiles
  for update
  using (auth.uid() = id);

-- Admins have unrestricted access to all profile rows
create policy "profiles_admin_all" on profiles
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- RLS policies — properties
-- ----------------------------------------------------------------

-- Public (including unauthenticated) can read available + approved listings
create policy "properties_public_select" on properties
  for select
  using (status = 'available' and moderation_status = 'approved');

-- Agents can insert listings where they are the owner
create policy "properties_agent_insert" on properties
  for insert
  with check (agent_id = auth.uid());

-- Agents can update their own listings
create policy "properties_agent_update" on properties
  for update
  using (agent_id = auth.uid());

-- Agents can delete their own listings
create policy "properties_agent_delete" on properties
  for delete
  using (agent_id = auth.uid());

-- Admins have unrestricted access to all property rows
create policy "properties_admin_all" on properties
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
