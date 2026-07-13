-- Admin panel: hide contributions (update) + memories gallery toggle
-- Run in Supabase SQL Editor

alter table public.couples
  add column if not exists memories_gallery_enabled boolean default true;

update public.couples
set memories_gallery_enabled = true
where memories_gallery_enabled is null;

drop policy if exists "contributions_public_update_dev" on public.contributions;
create policy "contributions_public_update_dev" on public.contributions
  for update using (true) with check (true);

drop policy if exists "contribution_media_public_update_dev" on public.contribution_media;
create policy "contribution_media_public_update_dev" on public.contribution_media
  for update using (true) with check (true);
