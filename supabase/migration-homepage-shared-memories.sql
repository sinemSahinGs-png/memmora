-- Homepage Shared Memories (run in Supabase SQL Editor)
-- Required for /admin → Anasayfa image upload + landing gallery.

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

insert into storage.buckets (id, name, public)
values ('homepage-memories', 'homepage-memories', true)
on conflict (id) do update set public = true;

drop policy if exists "homepage_memories_storage_public_read" on storage.objects;
create policy "homepage_memories_storage_public_read" on storage.objects
  for select
  using (bucket_id = 'homepage-memories');

-- Service role uploads; allow authenticated/service writes via storage policies
drop policy if exists "homepage_memories_storage_service_insert" on storage.objects;
create policy "homepage_memories_storage_service_insert" on storage.objects
  for insert
  with check (bucket_id = 'homepage-memories');

drop policy if exists "homepage_memories_storage_service_update" on storage.objects;
create policy "homepage_memories_storage_service_update" on storage.objects
  for update
  using (bucket_id = 'homepage-memories');

drop policy if exists "homepage_memories_storage_service_delete" on storage.objects;
create policy "homepage_memories_storage_service_delete" on storage.objects
  for delete
  using (bucket_id = 'homepage-memories');
