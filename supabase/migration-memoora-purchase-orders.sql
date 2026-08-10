-- Memoora product purchase orders (magnet / keychain flow)
-- Non-destructive: creates dedicated tables for the /satinal purchase wizard.

create table if not exists public.memoora_orders (
  id uuid primary key default gen_random_uuid(),
  bride_name text not null,
  groom_name text not null,
  wedding_date date not null,
  subtotal numeric(12, 2) not null,
  vat numeric(12, 2) not null,
  total numeric(12, 2) not null,
  vat_rate numeric(6, 4) not null default 0.20,
  payment_status text not null default 'awaiting_payment',
  order_status text not null default 'pending_payment',
  payment_provider text,
  payment_reference text,
  customer_email text,
  customer_phone text,
  customer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memoora_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.memoora_orders(id) on delete cascade,
  product_type text not null check (product_type in ('magnet', 'keychain')),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  line_subtotal numeric(12, 2) not null,
  line_vat numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_memoora_orders_payment_status
  on public.memoora_orders(payment_status);
create index if not exists idx_memoora_orders_order_status
  on public.memoora_orders(order_status);
create index if not exists idx_memoora_orders_created_at
  on public.memoora_orders(created_at desc);
create index if not exists idx_memoora_order_items_order_id
  on public.memoora_order_items(order_id);

notify pgrst, 'reload schema';
