import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import {
  createCouple,
  deleteCouple,
  fetchAllCouplesList,
  fetchCoupleById,
  setCoupleStatus,
  updateCoupleById,
} from "@/lib/supabase/couples-admin";
import type { CoupleCreateInput, CoupleStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const items = await fetchAllCouplesList();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[admin couples list]", error);
    return NextResponse.json({ error: "Çiftler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const input = (await req.json()) as CoupleCreateInput;
    const result = await createCouple(input);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ couple: result.couple });
  } catch (error) {
    console.error("[admin couples create]", error);
    return NextResponse.json({ error: "Çift oluşturulamadı." }, { status: 500 });
  }
}
