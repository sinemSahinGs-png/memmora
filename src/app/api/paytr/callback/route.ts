import {
  getPaytrCredentials,
} from "@/lib/paytr/config";
import { verifyPaytrCallbackHash } from "@/lib/paytr/hash";
import {
  fetchMemooraOrderByMerchantOid,
  markMemooraOrderFailedIfUnpaid,
  markMemooraOrderPaidOnce,
} from "@/lib/memoora-purchase/orders";

export const runtime = "nodejs";

function okText() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const credentials = getPaytrCredentials();
    if (!credentials) {
      console.error("[paytr/callback] missing credentials");
      return okText();
    }

    const form = await request.formData();
    const merchantOid = String(form.get("merchant_oid") ?? "").trim();
    const status = String(form.get("status") ?? "").trim();
    const totalAmount = String(form.get("total_amount") ?? "").trim();
    const hash = String(form.get("hash") ?? "").trim();

    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error("[paytr/callback] incomplete payload");
      return okText();
    }

    const valid = verifyPaytrCallbackHash({
      merchantKey: credentials.merchantKey,
      merchantSalt: credentials.merchantSalt,
      merchantOid,
      status,
      totalAmount,
      hash,
    });

    if (!valid) {
      console.error("[paytr/callback] invalid hash");
      // Do not mutate order status on invalid hash.
      return okText();
    }

    const existing = await fetchMemooraOrderByMerchantOid(merchantOid);
    if (!existing) {
      console.error("[paytr/callback] order not found");
      return okText();
    }

    if (status === "success") {
      // Idempotent: only first success flips unpaid → paid.
      await markMemooraOrderPaidOnce(merchantOid, merchantOid);
    } else {
      await markMemooraOrderFailedIfUnpaid(merchantOid, merchantOid);
    }

    return okText();
  } catch (error) {
    console.error(
      "[paytr/callback]",
      error instanceof Error ? error.message : error,
    );
    // Always acknowledge so PayTR does not retry forever on our bugs.
    return okText();
  }
}
