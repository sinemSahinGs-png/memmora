-- Memoora — Couple gallery ("Anılarımız") photos
-- Run after migration-google-drive.sql

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
  created_at timestamptz not null default now()
);

create index if not exists couple_photos_couple_id_idx
  on public.couple_photos(couple_id);

create index if not exists couple_photos_sort_idx
  on public.couple_photos(couple_id, sort_order);

alter table public.couple_photos enable row level security;

drop policy if exists "Public read visible couple photos" on public.couple_photos;
create policy "Public read visible couple photos"
  on public.couple_photos
  for select
  using (is_visible = true);
