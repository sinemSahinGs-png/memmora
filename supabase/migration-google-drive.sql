-- Memoora — Google Drive media migration
-- Run after schema.sql and prior migrations (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- contribution_media — Drive metadata (keeps existing rows)
-- ---------------------------------------------------------------------------

alter table public.contribution_media
  add column if not exists provider text default 'google_drive';

alter table public.contribution_media
  add column if not exists drive_file_id text;

alter table public.contribution_media
  add column if not exists drive_folder_id text;

alter table public.contribution_media
  add column if not exists drive_web_view_link text;

alter table public.contribution_media
  add column if not exists filename text;

alter table public.contribution_media
  add column if not exists file_size bigint;

alter table public.contribution_media
  add column if not exists mime_type text;

-- Backfill filename from legacy file_name where missing
update public.contribution_media
set filename = file_name
where filename is null and file_name is not null;

update public.contribution_media
set mime_type = file_type
where mime_type is null and file_type is not null;

update public.contribution_media
set provider = 'supabase'
where provider is null
  and file_url like '%/storage/v1/object/public/%';

-- ---------------------------------------------------------------------------
-- couples — Drive folder + contact emails
-- ---------------------------------------------------------------------------

alter table public.couples
  add column if not exists bride_email text;

alter table public.couples
  add column if not exists groom_email text;

alter table public.couples
  add column if not exists drive_folder_id text;

alter table public.couples
  add column if not exists drive_folder_url text;

alter table public.couples
  add column if not exists media_upload_enabled boolean default true;
