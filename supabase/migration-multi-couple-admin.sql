-- Memoora — Multi-couple SaaS admin migration
-- Run in Supabase SQL Editor AFTER schema.sql (and migration-couple-settings.sql if needed)
--
-- ⚠️ SECURITY NOTE (Production):
-- couples insert/update/delete via client + PIN MVP'dir.
-- Canlıda super admin işlemleri server-side auth ile korunmalıdır.

-- ---------------------------------------------------------------------------
-- Extend couples table
-- ---------------------------------------------------------------------------

alter table public.couples
  add column if not exists admin_pin text,
  add column if not exists playlist_title text,
  add column if not exists playlist_artist text,
  add column if not exists playlist_url text,
  add column if not exists status text default 'active';

-- Ensure status constraint
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'couples_status_check'
  ) then
    alter table public.couples
      add constraint couples_status_check
      check (status in ('active', 'passive'));
  end if;
end $$;

-- Backfill existing rows
update public.couples
set status = coalesce(status, 'active')
where status is null;

-- Mert & İrem — preserve existing data, set defaults
update public.couples
set
  status = coalesce(status, 'active'),
  admin_pin = coalesce(admin_pin, '0606'),
  updated_at = now()
where slug = 'mert-irem';

-- Berkin & Beste defaults if exists
update public.couples
set
  status = coalesce(status, 'active'),
  updated_at = now()
where slug = 'berkin-beste';

-- ---------------------------------------------------------------------------
-- RLS — super admin couple create (MVP dev)
-- ---------------------------------------------------------------------------

drop policy if exists "couples_public_insert_dev" on public.couples;
create policy "couples_public_insert_dev" on public.couples
  for insert with check (true);

-- Dev: allow delete from super admin (use passive in production UI)
drop policy if exists "couples_public_delete_dev" on public.couples;
create policy "couples_public_delete_dev" on public.couples
  for delete using (true);
