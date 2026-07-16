-- MEMOORA AFTER — post-wedding aftermovie
-- Run in Supabase SQL Editor

create table if not exists public.aftermovie_music (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  file_url text not null,
  storage_key text,
  duration_seconds numeric,
  license_source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_aftermovies (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  status text not null default 'draft',
  template_key text not null default 'memoora-classic',
  title text,
  opening_text text,
  closing_text text default 'Anılar yaşamaya devam ediyor.',
  poster_media_id uuid references public.contribution_media(id) on delete set null,
  music_id uuid references public.aftermovie_music(id) on delete set null,
  duration_preset text not null default 'standard',
  recommended_publish_at timestamptz,
  publish_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  render_started_at timestamptz,
  render_completed_at timestamptz,
  final_video_url text,
  final_video_storage_key text,
  render_provider text,
  render_job_id text,
  render_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id)
);

create table if not exists public.couple_aftermovie_media (
  id uuid primary key default gen_random_uuid(),
  aftermovie_id uuid not null references public.couple_aftermovies(id) on delete cascade,
  media_id uuid not null references public.contribution_media(id) on delete cascade,
  media_type text not null,
  sort_order integer not null default 0,
  trim_start_seconds numeric,
  trim_end_seconds numeric,
  category text,
  is_poster boolean not null default false,
  created_at timestamptz not null default now(),
  unique (aftermovie_id, media_id)
);

create index if not exists couple_aftermovies_couple_id_idx
  on public.couple_aftermovies (couple_id);
create index if not exists couple_aftermovies_publish_at_idx
  on public.couple_aftermovies (publish_at);
create index if not exists couple_aftermovie_media_aftermovie_id_idx
  on public.couple_aftermovie_media (aftermovie_id, sort_order);

alter table public.aftermovie_music enable row level security;
alter table public.couple_aftermovies enable row level security;
alter table public.couple_aftermovie_media enable row level security;

-- MVP-aligned open policies (service role used for privileged jobs)
drop policy if exists "aftermovie_music_public_select" on public.aftermovie_music;
create policy "aftermovie_music_public_select" on public.aftermovie_music
  for select using (is_active = true);

drop policy if exists "aftermovie_music_dev_write" on public.aftermovie_music;
create policy "aftermovie_music_dev_write" on public.aftermovie_music
  for all using (true) with check (true);

drop policy if exists "couple_aftermovies_public_select" on public.couple_aftermovies;
create policy "couple_aftermovies_public_select" on public.couple_aftermovies
  for select using (
    status in ('ready', 'scheduled', 'published')
    and approved_at is not null
    and publish_at is not null
    and publish_at <= now()
    and final_video_url is not null
  );

drop policy if exists "couple_aftermovies_dev_write" on public.couple_aftermovies;
create policy "couple_aftermovies_dev_write" on public.couple_aftermovies
  for all using (true) with check (true);

drop policy if exists "couple_aftermovie_media_public_select" on public.couple_aftermovie_media;
create policy "couple_aftermovie_media_public_select" on public.couple_aftermovie_media
  for select using (
    exists (
      select 1 from public.couple_aftermovies a
      where a.id = aftermovie_id
        and a.status in ('ready', 'scheduled', 'published')
        and a.approved_at is not null
        and a.publish_at is not null
        and a.publish_at <= now()
        and a.final_video_url is not null
    )
  );

drop policy if exists "couple_aftermovie_media_dev_write" on public.couple_aftermovie_media;
create policy "couple_aftermovie_media_dev_write" on public.couple_aftermovie_media
  for all using (true) with check (true);

-- Seed a couple of library tracks (placeholder URLs — replace in production)
insert into public.aftermovie_music (title, artist, file_url, license_source, duration_seconds)
select * from (values
  (
    'Soft Emerald Waltz',
    'Memoora Library',
    '/audio/aftermovie-soft-emerald.mp3',
    'Memoora licensed library',
    120
  ),
  (
    'Ivory Evening',
    'Memoora Library',
    '/audio/aftermovie-ivory-evening.mp3',
    'Memoora licensed library',
    150
  )
) as v(title, artist, file_url, license_source, duration_seconds)
where not exists (select 1 from public.aftermovie_music limit 1);
