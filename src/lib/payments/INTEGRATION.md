# Memoora Payment / PayTR Integration

Layer 1 (checkout UI + order model) is implemented.
Layer 2 (PayTR iFrame API) is implemented.

## Environment variables (Vercel + `.env.local`)

```
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
PAYTR_TEST_MODE=1
PAYTR_DEBUG_ON=0
SITE_URL=https://memoora.com.tr
NEXT_PUBLIC_SITE_URL=https://memoora.com.tr
```

- `PAYTR_TEST_MODE=1` → test, `0` → canlı
- Secrets never go to the client bundle

## PayTR merchant panel

Bildirim URL (callback):

```
https://memoora.com.tr/api/paytr/callback
```

## SQL

Apply in order if not already:

1. `supabase/migration-memoora-purchase-orders.sql`
2. `supabase/migration-memoora-orders-paytr.sql`

## Flow

1. `/satinal` → order created pending (`/api/purchase`)
2. `/api/paytr/token` → iframe token (server-side amount)
3. PayTR iframe on confirmation step
4. User returns to `/odeme/basarili` or `/odeme/basarisiz` (informational only)
5. Authoritative status via `/api/paytr/callback` → `paid` / `failed` (idempotent)
