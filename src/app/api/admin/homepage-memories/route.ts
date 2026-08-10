import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { parseFrameCropFromForm } from "@/lib/memories-frame-crop";
import {
  createHomepageMemory,
  getHomepageMemoryPublicUrl,
  HOMEPAGE_MEMORIES_BUCKET,
  listHomepageMemoriesAdmin,
} from "@/lib/supabase/homepage-memories";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getMaxUploadBytes,
  isAllowedGalleryImageMimeType,
} from "@/lib/upload-validation";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const items = await listHomepageMemoriesAdmin();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[homepage-memories list]", error);
    const message =
      error instanceof Error ? error.message : "Hatıralar yüklenemedi.";
    const missing = /homepage_shared_memories|schema cache|PGRST205/i.test(
      message,
    );
    return NextResponse.json(
      {
        error: missing
          ? "homepage_shared_memories tablosu yok. supabase/migration-homepage-shared-memories.sql çalıştırın."
          : message,
        code: missing ? "PGRST205" : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "multipart/form-data gerekli." },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }
    if (!isAllowedGalleryImageMimeType(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG veya WebP yükleyebilirsiniz." },
        { status: 400 },
      );
    }
    if (file.size > getMaxUploadBytes()) {
      return NextResponse.json(
        { error: "Dosya boyutu sınırı aşıldı." },
        { status: 400 },
      );
    }

    const crop = parseFrameCropFromForm(form);
    const guestName = String(form.get("guestName") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const sortOrder = Number(form.get("sortOrder") ?? 0) || 0;
    const isActive = String(form.get("isActive") ?? "true") !== "false";

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const storagePath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createServiceRoleClient();
    const { error: uploadError } = await supabase.storage
      .from(HOMEPAGE_MEMORIES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Yükleme başarısız." },
        { status: 500 },
      );
    }

    const publicUrl = getHomepageMemoryPublicUrl(storagePath);
    const item = await createHomepageMemory({
      storagePath,
      publicUrl,
      guestName,
      category,
      title,
      sortOrder,
      crop,
      isActive,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[homepage-memories upload]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Yükleme başarısız." },
      { status: 500 },
    );
  }
}
