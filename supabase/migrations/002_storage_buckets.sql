-- ============================================================
-- Migration 002: Storage buckets — avatars & properties
-- ============================================================

-- ----------------------------------------------------------------
-- avatars bucket
-- Authenticated read/write, 5 MB limit, JPEG/PNG/WebP only
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,                                          -- not public; authenticated access only
  5242880,                                        -- 5 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- properties bucket
-- Public read, authenticated write, 10 MB limit, JPEG/PNG/WebP only
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'properties',
  'properties',
  true,                                           -- public read
  10485760,                                       -- 10 MB in bytes
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- Storage RLS policies — avatars bucket
-- ----------------------------------------------------------------

-- Authenticated users can upload to their own folder (avatars/<uid>/*)
create policy "avatars_insert_own" on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read their own avatar files
create policy "avatars_select_own" on storage.objects
  for select
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update (replace) their own avatar files
create policy "avatars_update_own" on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own avatar files
create policy "avatars_delete_own" on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------
-- Storage RLS policies — properties bucket
-- ----------------------------------------------------------------

-- Anyone (including unauthenticated) can read property images (bucket is public)
create policy "properties_storage_select_public" on storage.objects
  for select
  using (bucket_id = 'properties');

-- Authenticated users can upload property images
create policy "properties_storage_insert_auth" on storage.objects
  for insert
  with check (
    bucket_id = 'properties'
    and auth.uid() is not null
  );

-- Authenticated users can update (replace) property images they own
create policy "properties_storage_update_own" on storage.objects
  for update
  using (
    bucket_id = 'properties'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete property images they own
create policy "properties_storage_delete_own" on storage.objects
  for delete
  using (
    bucket_id = 'properties'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
