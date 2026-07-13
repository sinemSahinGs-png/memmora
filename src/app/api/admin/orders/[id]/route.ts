import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/supabase/orders";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";

const VALID: OrderStatus[] = ["active", "passive", "archived"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: OrderStatus };
    const status = body.status;

    if (!status || !VALID.includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    await updateOrderStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Güncellenemedi." },
      { status: 500 }
    );
  }
}
