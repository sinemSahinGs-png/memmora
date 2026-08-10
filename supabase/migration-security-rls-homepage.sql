-- MEMOORA — harden RLS for couples / contributions (manual run in SQL Editor)
-- Run after existing schema + migrations.
--
-- NOTE: PIN hashing (bcrypt) is intentionally out of scope for this migration.
-- Store plaintext admin_pin only via service-role APIs until a follow-up hash migration.

-- ---------------------------------------------------------------------------
-- 1) Drop open *_dev write / delete policies
-- ---------------------------------------------------------------------------

drop policy if exists "couples_public_update_dev" on public.couples;
drop policy if exists "couples_public_insert_dev" on public.couples;
drop policy if exists "couples_public_delete_dev" on public.couples;

drop policy if exists "contributions_public_delete_dev" on public.contributions;
drop policy if exists "contributions_public_update_dev" on public.contributions;

drop policy if exists "contribution_media_public_delete_dev" on public.contribution_media;
drop policy if exists "contribution_media_public_update_dev" on public.contribution_media;

-- ---------------------------------------------------------------------------
-- 2) Keep narrow guest insert + public read (writes otherwise via service role)
-- ---------------------------------------------------------------------------

drop policy if exists "contributions_public_read" on public.contributions;
create policy "contributions_public_read" on public.contributions
  for select using (coalesce(is_visible, true) = true and coalesce(hidden, false) = false);

drop policy if exists "contributions_public_insert" on public.contributions;
create policy "contributions_public_insert" on public.contributions
  for insert
  with check (
    guest_name is not null
    and length(trim(guest_name)) > 0
    and message is not null
    and length(trim(message)) > 0
    and couple_id is not null
  );

drop policy if exists "contribution_media_public_read" on public.contribution_media;
create policy "contribution_media_public_read" on public.contribution_media
  for select using (coalesce(hidden, false) = false);

drop policy if exists "contribution_media_public_insert" on public.contribution_media;
create policy "contribution_media_public_insert" on public.contribution_media
  for insert with check (contribution_id is not null and file_url is not null);

-- Couples: public read of non-deleted rows (column privileges hide secrets)
drop policy if exists "couples_public_read" on public.couples;
create policy "couples_public_read" on public.couples
  for select using (deleted_at is null);

-- ---------------------------------------------------------------------------
-- 3) Hide sensitive couple columns from anon / authenticated
-- ---------------------------------------------------------------------------

revoke select (admin_pin, bride_email, groom_email, drive_folder_id, drive_folder_url)
  on table public.couples from anon, authenticated;

-- Explicit: no client writes on couples (service role bypasses RLS)
revoke insert, update, delete on table public.couples from anon, authenticated;
revoke update, delete on table public.contributions from anon, authenticated;
revoke update, delete on table public.contribution_media from anon, authenticated;

grant select on table public.couples to anon, authenticated;
grant select, insert on table public.contributions to anon, authenticated;
grant select, insert on table public.contribution_media to anon, authenticated;

-- Re-apply column revoke after broad SELECT grant
revoke select (admin_pin, bride_email, groom_email, drive_folder_id, drive_folder_url)
  on table public.couples from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) Homepage shared memories table + bucket (public read of active rows)
-- ---------------------------------------------------------------------------

create table if not exists public.homepage_shared_memories (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  guest_name text not null default '',
  category text not null default '',
  title text not null default '',
  sort_order integer not null default 0,
  frame_zoom real not null default 1,
  frame_pan_x real not null default 0,
  frame_pan_y real not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_shared_memories_active_sort_idx
  on public.homepage_shared_memories (is_active, sort_order);

alter table public.homepage_shared_memories enable row level security;

drop policy if exists "homepage_memories_public_read" on public.homepage_shared_memories;
create policy "homepage_memories_public_read" on public.homepage_shared_memories
  for select using (is_active = true);

revoke insert, update, delete on table public.homepage_shared_memories from anon, authenticated;
grant select on table public.homepage_shared_memories to anon, authenticated;

-- Storage bucket (public read for landing images)
insert into storage.buckets (id, name, public)
values ('homepage-memories', 'homepage-memories', true)
on conflict (id) do update set public = true;

drop policy if exists "homepage_memories_storage_public_read" on storage.objects;
create policy "homepage_memories_storage_public_read" on storage.objects
  for select
  using (bucket_id = 'homepage-memories');
