-- PayTR merchant_oid for memoora purchase orders (idempotent callbacks)
alter table public.memoora_orders
  add column if not exists merchant_oid text;

create unique index if not exists idx_memoora_orders_merchant_oid
  on public.memoora_orders(merchant_oid)
  where merchant_oid is not null;

notify pgrst, 'reload schema';
