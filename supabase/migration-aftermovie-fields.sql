-- MEMOORA AFTER — additive production fields
-- Safe to run if migration-aftermovie.sql was already applied.

alter table public.couple_aftermovies
  add column if not exists submitted_at timestamptz;

alter table public.couple_aftermovies
  add column if not exists revision_requested_at timestamptz;

alter table public.couple_aftermovies
  add column if not exists revision_note text;

alter table public.couple_aftermovies
  add column if not exists revision_resolved_at timestamptz;

alter table public.couple_aftermovies
  add column if not exists production_notes text;

alter table public.couple_aftermovies
  add column if not exists final_video_duration_seconds numeric;

alter table public.couple_aftermovies
  add column if not exists final_poster_url text;

alter table public.couple_aftermovies
  add column if not exists final_poster_storage_key text;
