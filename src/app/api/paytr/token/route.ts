import { NextResponse } from "next/server";
import {
  getClientIp,
  getPaytrCredentials,
  getPaytrDebugOn,
  getPaytrMissingEnvKeys,
  getPaytrTestMode,
  getSiteUrl,
} from "@/lib/paytr/config";
import {
  createPaytrTokenHash,
  encodePaytrBasket,
  generateMerchantOid,
  toPaytrPaymentAmount,
} from "@/lib/paytr/hash";
import {
  fetchMemooraOrderById,
  updateMemooraOrderPayment,
} from "@/lib/memoora-purchase/orders";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TokenBody = {
  orderId?: string;
};

export async function POST(request: Request) {
  try {
    if (!isServiceRoleConfigured()) {
      return NextResponse.json(
        { error: "Supabase yapılandırması eksik." },
        { status: 503 },
      );
    }

    const credentials = getPaytrCredentials();
    if (!credentials) {
      return NextResponse.json(
        {
          error: "PayTR yapılandırması eksik.",
          missing: getPaytrMissingEnvKeys(),
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as TokenBody;
    const orderId = String(body.orderId ?? "").trim();
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId gerekli." },
        { status: 400 },
      );
    }

    const order = await fetchMemooraOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Bu sipariş zaten ödenmiş." },
        { status: 409 },
      );
    }

    const email = order.customerEmail?.trim();
    const phone = order.customerPhone?.trim();
    if (!email) {
      return NextResponse.json(
        { error: "Ödeme için e-posta gerekli." },
        { status: 400 },
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Ödeme için telefon gerekli." },
        { status: 400 },
      );
    }

    // Server-side amount only — never trust client price.
    const paymentAmount = toPaytrPaymentAmount(order.total);
    const userBasket = encodePaytrBasket(
      order.items.map((item) => ({
        name: item.productName,
        // PayTR basket unit price is VAT-inclusive line unit in many stores;
        // we send VAT-inclusive unit = lineTotal / qty from server totals.
        unitPrice: item.lineTotal / item.quantity,
        quantity: item.quantity,
      })),
    );

    const merchantOid =
      order.merchantOid?.trim() || generateMerchantOid();
    const userIp = getClientIp(request);
    const testMode = getPaytrTestMode();
    const debugOn = getPaytrDebugOn();
    const noInstallment = "0";
    const maxInstallment = "0";
    const currency = "TL";
    const siteUrl = getSiteUrl(new URL(request.url).origin);
    const merchantOkUrl = `${siteUrl}/odeme/basarili`;
    const merchantFailUrl = `${siteUrl}/odeme/basarisiz`;
    const userName =
      order.customerName?.trim() ||
      `${order.brideName} & ${order.groomName}`;
    const userAddress = "Türkiye";

    const paytrToken = createPaytrTokenHash({
      merchantId: credentials.merchantId,
      merchantKey: credentials.merchantKey,
      merchantSalt: credentials.merchantSalt,
      userIp,
      merchantOid,
      email,
      paymentAmount,
      userBasket,
      noInstallment,
      maxInstallment,
      currency,
      testMode,
    });

    const form = new URLSearchParams({
      merchant_id: credentials.merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount,
      user_basket: userBasket,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      currency,
      test_mode: testMode,
      paytr_token: paytrToken,
      user_name: userName,
      user_address: userAddress,
      user_phone: phone,
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      debug_on: debugOn,
      timeout_limit: "30",
      lang: "tr",
    });

    const paytrResponse = await fetch(
      "https://www.paytr.com/odeme/api/get-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
        cache: "no-store",
      },
    );

    const rawText = await paytrResponse.text();
    let payload: { status?: string; token?: string; reason?: string } = {};
    try {
      payload = JSON.parse(rawText) as typeof payload;
    } catch {
      return NextResponse.json(
        { error: "PayTR yanıtı okunamadı." },
        { status: 502 },
      );
    }

    if (payload.status !== "success" || !payload.token) {
      return NextResponse.json(
        {
          error: payload.reason || "PayTR token alınamadı.",
        },
        { status: 502 },
      );
    }

    await updateMemooraOrderPayment(order.id, {
      paymentStatus: "awaiting_payment",
      orderStatus: "pending_payment",
      paymentProvider: "paytr",
      paymentReference: merchantOid,
      merchantOid,
    });

    return NextResponse.json({
      success: true,
      iframeToken: payload.token,
      merchantOid,
      orderId: order.id,
      iframeUrl: `https://www.paytr.com/odeme/guvenli/${payload.token}`,
    });
  } catch (error) {
    console.error("[paytr/token]", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "PayTR token oluşturulamadı.",
      },
      { status: 500 },
    );
  }
}
