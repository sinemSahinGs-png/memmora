-- Memoora — Couple settings migration
-- Run in Supabase SQL Editor after schema.sql

alter table public.couples
  add column if not exists bride_name text,
  add column if not exists groom_name text,
  add column if not exists display_title text,
  add column if not exists hero_subtitle text default 'Her not bir yaprak olur.',
  add column if not exists hero_video_url text default '/videos/living-tree-bg.mp4',
  add column if not exists quiz_enabled boolean default true,
  add column if not exists quiz_winner_name text,
  add column if not exists updated_at timestamptz default now();

-- Backfill from legacy names column
update public.couples
set
  display_title = coalesce(display_title, names),
  groom_name = coalesce(
    groom_name,
    nullif(trim(split_part(names, ' & ', 1)), '')
  ),
  bride_name = coalesce(
    bride_name,
    nullif(trim(split_part(names, ' & ', 2)), '')
  ),
  hero_subtitle = coalesce(hero_subtitle, 'Her not bir yaprak olur.'),
  hero_video_url = coalesce(hero_video_url, '/videos/living-tree-bg.mp4'),
  quiz_enabled = coalesce(quiz_enabled, true)
where names is not null;

-- Mert & İrem seed refresh
update public.couples
set
  slug = 'mert-irem',
  names = 'Mert & İrem',
  groom_name = 'Mert',
  bride_name = 'İrem',
  display_title = 'Mert & İrem',
  wedding_date = '2026-06-06',
  hero_subtitle = 'Her not bir yaprak olur.',
  hero_video_url = '/videos/living-tree-bg.mp4',
  quiz_enabled = true,
  updated_at = now()
where slug = 'mert-irem';

-- Optional: Berkin & Beste example couple
insert into public.couples (
  slug, names, groom_name, bride_name, display_title,
  wedding_date, hero_subtitle, hero_video_url, quiz_enabled
)
values (
  'berkin-beste', 'Berkin & Beste', 'Berkin', 'Beste', 'Berkin & Beste',
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

-- Dev: allow couple settings update from admin panel (MVP only)
drop policy if exists "couples_public_update_dev" on public.couples;
create policy "couples_public_update_dev" on public.couples
  for update using (true) with check (true);
