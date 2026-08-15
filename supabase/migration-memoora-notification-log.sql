-- Idempotent Telegram / ops notification log for Memoora.
-- Non-destructive.

create table if not exists public.memoora_notification_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.memoora_orders(id) on delete set null,
  channel text not null default 'telegram',
  event_type text not null,
  event_key text not null,
  sent_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists idx_memoora_notification_log_event_key
  on public.memoora_notification_log(event_key);

create index if not exists idx_memoora_notification_log_order_id
  on public.memoora_notification_log(order_id);

create index if not exists idx_memoora_notification_log_sent_at
  on public.memoora_notification_log(sent_at desc);

notify pgrst, 'reload schema';
