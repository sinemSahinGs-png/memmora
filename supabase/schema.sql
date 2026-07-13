-- Memoora — Supabase schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  names text not null,
  bride_name text,
  groom_name text,
  display_title text,
  wedding_date date,
  hero_subtitle text default 'Her not bir yaprak olur.',
  hero_video_url text default '/videos/living-tree-bg.mp4',
  quiz_enabled boolean default true,
  quiz_winner_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  guest_name text not null,
  message text not null,
  is_visible boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.contribution_media (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  file_url text not null,
  file_type text,
  file_name text,
  created_at timestamptz default now()
);

create index if not exists contributions_couple_id_idx on public.contributions(couple_id);
create index if not exists contributions_created_at_idx on public.contributions(created_at desc);
create index if not exists contribution_media_contribution_id_idx on public.contribution_media(contribution_id);

-- Couple gallery ("Anılarımız")
create table if not exists public.couple_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  caption text,
  sort_order integer not null default 0,
  provider text default 'google_drive',
  drive_file_id text,
  drive_folder_id text,
  drive_web_view_link text,
  image_url text not null,
  filename text,
  file_size bigint,
  mime_type text,
  is_visible boolean not null default true,
  frame_zoom real not null default 1,
  frame_pan_x real not null default 0,
  frame_pan_y real not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists couple_photos_couple_id_idx on public.couple_photos(couple_id);
create index if not exists couple_photos_sort_idx on public.couple_photos(couple_id, sort_order);

-- ---------------------------------------------------------------------------
-- Seed: Mert & İrem
-- ---------------------------------------------------------------------------

insert into public.couples (
  slug, names, groom_name, bride_name, display_title,
  wedding_date, hero_subtitle, hero_video_url, quiz_enabled
)
values (
  'mert-irem', 'Mert & İrem', 'Mert', 'İrem', 'Mert & İrem',
  '2026-06-06', 'Her not bir yaprak olur.', '/videos/living-tree-bg.mp4', true
)
on conflict (slug) do update set
  names = excluded.names,
  groom_name = excluded.groom_name,
  bride_name = excluded.bride_name,
  display_title = excluded.display_title,
  wedding_date = excluded.wedding_date,
  hero_subtitle = excluded.hero_subtitle,
  hero_video_url = excluded.hero_video_url,
  quiz_enabled = excluded.quiz_enabled,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Storage bucket: memories
-- Create in Dashboard → Storage → New bucket → name: memories → Public bucket
-- Or run (requires storage extension):
-- insert into storage.buckets (id, name, public) values ('memories', 'memories', true)
-- on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS — development-friendly policies
-- ⚠️ SECURITY NOTE: Production'da admin silme/güncelleme işlemleri
--    server-side auth (service role + API route) ile korunmalıdır.
--    Client-side PIN yalnızca MVP geliştirme içindir.
-- ---------------------------------------------------------------------------

alter table public.couples enable row level security;
alter table public.contributions enable row level security;
alter table public.contribution_media enable row level security;
alter table public.couple_photos enable row level security;

-- Couples: public read
drop policy if exists "couples_public_read" on public.couples;
create policy "couples_public_read" on public.couples
  for select using (true);

-- Dev only: couple settings update from admin panel (MVP)
drop policy if exists "couples_public_update_dev" on public.couples;
create policy "couples_public_update_dev" on public.couples
  for update using (true) with check (true);

-- Contributions: public read + insert (guests leave leaves)
drop policy if exists "contributions_public_read" on public.contributions;
create policy "contributions_public_read" on public.contributions
  for select using (true);

drop policy if exists "contributions_public_insert" on public.contributions;
create policy "contributions_public_insert" on public.contributions
  for insert with check (true);

-- Dev only: allow delete from client (admin panel MVP)
drop policy if exists "contributions_public_delete_dev" on public.contributions;
create policy "contributions_public_delete_dev" on public.contributions
  for delete using (true);

drop policy if exists "contributions_public_update_dev" on public.contributions;
create policy "contributions_public_update_dev" on public.contributions
  for update using (true) with check (true);

-- Contribution media: public read + insert
drop policy if exists "contribution_media_public_read" on public.contribution_media;
create policy "contribution_media_public_read" on public.contribution_media
  for select using (true);

drop policy if exists "contribution_media_public_insert" on public.contribution_media;
create policy "contribution_media_public_insert" on public.contribution_media
  for insert with check (true);

drop policy if exists "contribution_media_public_delete_dev" on public.contribution_media;
create policy "contribution_media_public_delete_dev" on public.contribution_media
  for delete using (true);

drop policy if exists "contribution_media_public_update_dev" on public.contribution_media;
create policy "contribution_media_public_update_dev" on public.contribution_media
  for update using (true) with check (true);

drop policy if exists "Public read visible couple photos" on public.couple_photos;
create policy "Public read visible couple photos"
  on public.couple_photos
  for select
  using (is_visible = true);

-- Storage policies (run after bucket exists)
-- drop policy if exists "memories_public_read" on storage.objects;
-- create policy "memories_public_read" on storage.objects
--   for select using (bucket_id = 'memories');
--
-- drop policy if exists "memories_public_upload" on storage.objects;
-- create policy "memories_public_upload" on storage.objects
--   for insert with check (bucket_id = 'memories');
--
-- drop policy if exists "memories_public_delete_dev" on storage.objects;
-- create policy "memories_public_delete_dev" on storage.objects
--   for delete using (bucket_id = 'memories');
