import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { fetchAllOrders } from "@/lib/supabase/orders";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const orders = await fetchAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Siparişler yüklenemedi." },
      { status: 500 },
    );
  }
}
