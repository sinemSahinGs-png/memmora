import { NextResponse } from "next/server";
import { createMemooraOrder } from "@/lib/memoora-purchase/orders";
import {
  PurchaseValidationError,
  validateCreateOrderInput,
} from "@/lib/memoora-purchase/validation";
import { resolvePaymentProvider } from "@/lib/payments/provider";
import { isServiceRoleConfigured } from "@/lib/supabase/server";
import { calculatePurchaseTotals } from "@/lib/memoora-purchase/pricing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateCreateOrderInput(body);
    const totals = calculatePurchaseTotals(input.items);

    if (!isServiceRoleConfigured()) {
      return NextResponse.json(
        {
          error:
            "Sipariş kaydı için Supabase yapılandırması eksik. Lütfen yöneticiye bildirin.",
          totals,
        },
        { status: 503 },
      );
    }

    const provider = resolvePaymentProvider();
    const configured = provider.isConfigured();

    const order = await createMemooraOrder(input, {
      paymentStatus: configured ? "awaiting_payment" : "provider_not_configured",
      orderStatus: "pending_payment",
      paymentProvider: provider.id,
    });

    const origin = new URL(request.url).origin;
    const payment = await provider.createPaymentIntent({
      orderId: order.id,
      amount: order.total,
      currency: "TRY",
      description: `Memoora — ${order.brideName} & ${order.groomName}`,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      lineItems: order.items.map((item) => ({
        productType: item.productType,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      successUrl: `${origin}/satinal?orderId=${order.id}&status=success`,
      failUrl: `${origin}/satinal?orderId=${order.id}&status=fail`,
    });

    return NextResponse.json({
      success: true,
      order,
      payment,
      totals,
    });
  } catch (error) {
    if (error instanceof PurchaseValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Sipariş oluşturulamadı.",
      },
      { status: 500 },
    );
  }
}
