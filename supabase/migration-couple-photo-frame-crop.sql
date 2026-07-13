-- Frame crop / focal positioning for couple gallery photos
-- Run after migration-couple-gallery.sql

alter table public.couple_photos
  add column if not exists frame_zoom real not null default 1,
  add column if not exists frame_pan_x real not null default 0,
  add column if not exists frame_pan_y real not null default 0;

comment on column public.couple_photos.frame_zoom is 'Cover zoom inside memories frame (1–3)';
comment on column public.couple_photos.frame_pan_x is 'Horizontal pan offset % inside frame';
comment on column public.couple_photos.frame_pan_y is 'Vertical pan offset % inside frame';
