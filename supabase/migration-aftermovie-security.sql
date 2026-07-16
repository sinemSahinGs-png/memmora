-- MEMOORA AFTER — harden RLS (replace MVP-open write policies)
-- Run after migration-aftermovie.sql (+ fields migration).

-- Drop open / overly permissive write policies
drop policy if exists "aftermovie_music_dev_write" on public.aftermovie_music;
drop policy if exists "couple_aftermovies_dev_write" on public.couple_aftermovies;
drop policy if exists "couple_aftermovie_media_dev_write" on public.couple_aftermovie_media;

-- Music: public may only read active library tracks
drop policy if exists "aftermovie_music_public_select" on public.aftermovie_music;
create policy "aftermovie_music_public_select" on public.aftermovie_music
  for select
  using (is_active = true);

-- Aftermovies: anonymous may only select published-ready public rows
drop policy if exists "couple_aftermovies_public_select" on public.couple_aftermovies;
create policy "couple_aftermovies_public_select" on public.couple_aftermovies
  for select
  using (
    status in ('ready', 'scheduled', 'published')
    and approved_at is not null
    and publish_at is not null
    and publish_at <= now()
    and final_video_url is not null
    and coalesce(status, '') <> 'revision_requested'
    and coalesce(status, '') <> 'unpublished'
    and coalesce(status, '') <> 'failed'
  );

-- Selection rows only when parent aftermovie is publicly available
drop policy if exists "couple_aftermovie_media_public_select" on public.couple_aftermovie_media;
create policy "couple_aftermovie_media_public_select" on public.couple_aftermovie_media
  for select
  using (
    exists (
      select 1
      from public.couple_aftermovies a
      where a.id = aftermovie_id
        and a.status in ('ready', 'scheduled', 'published')
        and a.approved_at is not null
        and a.publish_at is not null
        and a.publish_at <= now()
        and a.final_video_url is not null
    )
  );

-- Explicitly deny anon/authenticated writes (service role bypasses RLS)
revoke insert, update, delete on public.aftermovie_music from anon, authenticated;
revoke insert, update, delete on public.couple_aftermovies from anon, authenticated;
revoke insert, update, delete on public.couple_aftermovie_media from anon, authenticated;

grant select on public.aftermovie_music to anon, authenticated;
grant select on public.couple_aftermovies to anon, authenticated;
grant select on public.couple_aftermovie_media to anon, authenticated;
