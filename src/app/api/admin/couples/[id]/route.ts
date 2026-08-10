import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import {
  deleteCouple,
  fetchCoupleById,
  setCoupleStatus,
  updateCoupleById,
} from "@/lib/supabase/couples-admin";
import type { CoupleCreateInput, CoupleStatus } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const couple = await fetchCoupleById(id, { includeAdminPin: true });
  if (!couple) {
    return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ couple });
}

export async function PATCH(req: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    const body = (await req.json()) as
      | { action: "status"; status: CoupleStatus }
      | CoupleCreateInput;

    if ("action" in body && body.action === "status") {
      const result = await setCoupleStatus(id, body.status);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    const result = await updateCoupleById(id, body as CoupleCreateInput);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ couple: result.couple });
  } catch (error) {
    console.error("[admin couple patch]", error);
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const result = await deleteCouple(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
