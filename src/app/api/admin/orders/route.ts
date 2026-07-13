import { NextResponse } from "next/server";
import { fetchAllOrders } from "@/lib/supabase/orders";

export const runtime = "nodejs";

export async function GET() {
  try {
    const orders = await fetchAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Siparişler yüklenemedi." },
      { status: 500 }
    );
  }
}
