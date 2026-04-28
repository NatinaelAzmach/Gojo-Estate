-- ============================================================
-- Migration 003: Extend properties table for full listing system
-- ============================================================

-- Add new columns to existing properties table
alter table properties
  add column if not exists listing_type   text not null default 'sale'
                                            check (listing_type in ('sale', 'rent')),
  add column if not exists property_type  text not null default 'house'
                                            check (property_type in ('house', 'apartment', 'condo', 'land', 'commercial')),
  add column if not exists rent_price     numeric(12,2),
  add column if not exists city           text,
  add column if not exists state          text,
  add column if not exists zip_code       text,
  add column if not exists featured_image text,
  add column if not exists approved_at    timestamptz,
  add column if not exists updated_at     timestamptz not null default now();

-- Extend status to include 'rented'
alter table properties
  drop constraint if exists properties_status_check;

alter table properties
  add constraint properties_status_check
    check (status in ('available', 'pending', 'sold', 'rented', 'archived'));

-- Allow any authenticated user (not just agents) to insert properties
drop policy if exists "properties_agent_insert" on properties;
create policy "properties_user_insert" on properties
  for insert
  with check (auth.uid() is not null and agent_id = auth.uid());

-- Allow users to update their own PENDING properties only
drop policy if exists "properties_agent_update" on properties;
create policy "properties_owner_update_pending" on properties
  for update
  using (agent_id = auth.uid() and moderation_status = 'pending');

-- Allow users to delete their own PENDING properties
drop policy if exists "properties_agent_delete" on properties;
create policy "properties_owner_delete_pending" on properties
  for delete
  using (agent_id = auth.uid() and moderation_status = 'pending');

-- Public can also see sold/rented approved listings
drop policy if exists "properties_public_select" on properties;
create policy "properties_public_select" on properties
  for select
  using (moderation_status = 'approved');

-- Users can see their own properties regardless of status
create policy "properties_owner_select_own" on properties
  for select
  using (agent_id = auth.uid());

-- updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_updated_at
  before update on properties
  for each row execute procedure update_updated_at();
