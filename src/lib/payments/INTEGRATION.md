# Memoora Payment / POS Integration

Layer 1 (checkout UI + order model) is implemented.
Layer 2 (real POS provider) is abstracted but not connected.

## Required from client before production payment

- POS / payment provider name
- API documentation
- Test API key / secret
- Merchant / terminal / store IDs (if applicable)
- 3D Secure requirement
- Success callback URL
- Fail callback URL
- Webhook / notification requirements
- Supported card / payment methods
- Installment support needed or not
- Tax invoice / company billing requirements

## Env keys prepared in code

- `MEMOORA_PAYMENT_PROVIDER`
- `MEMOORA_PAYMENT_API_KEY`
- `MEMOORA_PAYMENT_API_SECRET`
- `MEMOORA_PAYMENT_MERCHANT_ID`
- `MEMOORA_PAYMENT_SUCCESS_URL`
- `MEMOORA_PAYMENT_FAIL_URL`
- `MEMOORA_PAYMENT_WEBHOOK_SECRET`

## SQL migration

Apply: `supabase/migration-memoora-purchase-orders.sql`
