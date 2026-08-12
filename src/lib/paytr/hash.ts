import { createHmac, randomBytes } from "crypto";

/**
 * Official PayTR iFrame token hash:
 * HMAC-SHA256(merchant_id + user_ip + merchant_oid + email + payment_amount +
 *   user_basket + no_installment + max_installment + currency + test_mode + merchant_salt, merchant_key)
 * → base64
 */
export function createPaytrTokenHash(input: {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmount: string;
  userBasket: string;
  noInstallment: string;
  maxInstallment: string;
  currency: string;
  testMode: string;
}): string {
  const hashStr =
    input.merchantId +
    input.userIp +
    input.merchantOid +
    input.email +
    input.paymentAmount +
    input.userBasket +
    input.noInstallment +
    input.maxInstallment +
    input.currency +
    input.testMode;
  const paytrToken = hashStr + input.merchantSalt;
  return createHmac("sha256", input.merchantKey)
    .update(paytrToken)
    .digest("base64");
}

/**
 * Official PayTR callback hash:
 * HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key) → base64
 */
export function createPaytrCallbackHash(input: {
  merchantKey: string;
  merchantSalt: string;
  merchantOid: string;
  status: string;
  totalAmount: string;
}): string {
  const paytrToken =
    input.merchantOid + input.merchantSalt + input.status + input.totalAmount;
  return createHmac("sha256", input.merchantKey)
    .update(paytrToken)
    .digest("base64");
}

export function verifyPaytrCallbackHash(input: {
  merchantKey: string;
  merchantSalt: string;
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const expected = createPaytrCallbackHash(input);
  return expected === input.hash;
}

/** TL → kuruş integer string (e.g. 132.00 → "13200") */
export function toPaytrPaymentAmount(totalTry: number): string {
  return String(Math.round(totalTry * 100));
}

/**
 * PayTR basket: Base64(JSON([[name, unitPrice, qty], ...]))
 * unitPrice is TL string with 2 decimals.
 */
export function encodePaytrBasket(
  lines: Array<{ name: string; unitPrice: number; quantity: number }>,
): string {
  const basket = lines.map((line) => [
    line.name,
    line.unitPrice.toFixed(2),
    line.quantity,
  ]);
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}

/** Alphanumeric merchant_oid, max 64 chars (PayTR requirement). */
export function generateMerchantOid(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(8).toString("hex").toUpperCase();
  const oid = `MO${stamp}${rand}`;
  return oid.slice(0, 64);
}
