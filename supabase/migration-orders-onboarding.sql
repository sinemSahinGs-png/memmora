-- Memoora orders + onboarding columns (non-destructive)

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  customer_phone text,
  package_type text,
  price numeric,
  payment_status text default 'manual_pending',
  payment_provider text,
  payment_reference text,
  couple_id uuid references public.couples(id),
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

alter table public.couples add column if not exists package_type text;
alter table public.couples add column if not exists bride_email text;
alter table public.couples add column if not exists groom_email text;
alter table public.couples add column if not exists drive_folder_id text;
alter table public.couples add column if not exists drive_folder_url text;
alter table public.couples add column if not exists media_upload_enabled boolean default true;
alter table public.couples add column if not exists quiz_enabled boolean default true;
alter table public.couples add column if not exists playlist_title text;
alter table public.couples add column if not exists playlist_artist text;
alter table public.couples add column if not exists playlist_url text;
alter table public.couples add column if not exists couple_photo_url text;
alter table public.couples add column if not exists status text default 'active';
alter table public.couples add column if not exists archived_at timestamptz;
alter table public.couples add column if not exists deleted_at timestamptz;
alter table public.couples add column if not exists created_by_order_id uuid;
alter table public.couples add column if not exists wedding_date date;

alter table public.contributions add column if not exists hidden boolean default false;
alter table public.contributions add column if not exists deleted_at timestamptz;

alter table public.contribution_media add column if not exists hidden boolean default false;
alter table public.contribution_media add column if not exists deleted_at timestamptz;

create index if not exists idx_orders_couple_id on public.orders(couple_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_couples_created_by_order on public.couples(created_by_order_id);
create index if not exists idx_couples_deleted_at on public.couples(deleted_at);
create index if not exists idx_contributions_deleted_at on public.contributions(deleted_at);

notify pgrst, 'reload schema';
