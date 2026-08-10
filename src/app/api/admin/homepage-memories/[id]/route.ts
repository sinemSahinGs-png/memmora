import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { clampFrameCrop } from "@/lib/memories-frame-crop";
import {
  deleteHomepageMemory,
  updateHomepageMemory,
} from "@/lib/supabase/homepage-memories";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      guestName?: string;
      category?: string;
      title?: string;
      sortOrder?: number;
      isActive?: boolean;
      frameZoom?: number;
      framePanX?: number;
      framePanY?: number;
    };

    const hasCrop =
      body.frameZoom !== undefined ||
      body.framePanX !== undefined ||
      body.framePanY !== undefined;

    const item = await updateHomepageMemory(id, {
      guestName: body.guestName,
      category: body.category,
      title: body.title,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
      crop: hasCrop
        ? clampFrameCrop({
            zoom: body.frameZoom,
            panX: body.framePanX,
            panY: body.framePanY,
          })
        : undefined,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[homepage-memories patch]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Güncelleme başarısız." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    await deleteHomepageMemory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[homepage-memories delete]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Silme başarısız." },
      { status: 500 },
    );
  }
}
