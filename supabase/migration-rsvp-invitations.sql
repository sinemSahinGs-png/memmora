-- Memoora — E-Davetiye & Katılım (RSVP) migration
-- Run in Supabase SQL Editor after schema.sql

-- ---------------------------------------------------------------------------
-- Couples — invitation / RSVP settings
-- ---------------------------------------------------------------------------

alter table public.couples
  add column if not exists invitation_enabled boolean default true,
  add column if not exists invitation_title text,
  add column if not exists invitation_message text,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists venue_maps_url text,
  add column if not exists wedding_time text,
  add column if not exists rsvp_enabled boolean default true,
  add column if not exists rsvp_deadline date,
  add column if not exists max_guest_count integer default 5;

update public.couples
set
  invitation_enabled = coalesce(invitation_enabled, true),
  invitation_message = coalesce(
    invitation_message,
    'Bu özel günde bizimle olmanızdan mutluluk duyarız.'
  ),
  rsvp_enabled = coalesce(rsvp_enabled, true),
  max_guest_count = coalesce(max_guest_count, 5)
where invitation_message is null
   or invitation_enabled is null
   or rsvp_enabled is null
   or max_guest_count is null;

-- ---------------------------------------------------------------------------
-- RSVP responses
-- ---------------------------------------------------------------------------

create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  guest_name text not null,
  phone text,
  status text not null check (status in ('attending', 'not_attending', 'maybe')),
  guest_count integer default 1,
  note text,
  source text default 'invite',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists rsvp_responses_couple_id_idx
  on public.rsvp_responses(couple_id);

create index if not exists rsvp_responses_status_idx
  on public.rsvp_responses(couple_id, status);

create index if not exists rsvp_responses_created_at_idx
  on public.rsvp_responses(couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — MVP (public insert via API; admin read via dev policy)
-- ---------------------------------------------------------------------------

alter table public.rsvp_responses enable row level security;

drop policy if exists "rsvp_responses_public_insert_dev" on public.rsvp_responses;
create policy "rsvp_responses_public_insert_dev" on public.rsvp_responses
  for insert with check (true);

drop policy if exists "rsvp_responses_admin_read_dev" on public.rsvp_responses;
create policy "rsvp_responses_admin_read_dev" on public.rsvp_responses
  for select using (deleted_at is null);

notify pgrst, 'reload schema';
