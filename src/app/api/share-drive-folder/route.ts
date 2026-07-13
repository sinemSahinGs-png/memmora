import { NextResponse } from "next/server";
import {
  getMissingDriveEnvVars,
  getOrCreateCoupleFolder,
} from "@/lib/google/drive";
import {
  assertCoupleFolderNotParent,
  shareDriveFolderWithEmails,
} from "@/lib/google/drive-share";
import { isValidEmail, normalizeEmail } from "@/lib/onboarding-utils";
import type { ShareDriveInvalidEmail } from "@/lib/share-drive-folder-client";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// TODO: Add rate limiting and admin auth before production.

function collectShareEmails(
  couple: {
    bride_email: string | null;
    groom_email: string | null;
  },
  overrides?: { brideEmail?: string; groomEmail?: string }
): {
  validEmails: string[];
  invalidEmails: ShareDriveInvalidEmail[];
} {
  const validEmails: string[] = [];
  const invalidEmails: ShareDriveInvalidEmail[] = [];
  const seen = new Set<string>();

  const entries: Array<{ field: "bride" | "groom"; raw: string | null }> = [
    {
      field: "bride",
      raw: overrides?.brideEmail ?? couple.bride_email,
    },
    {
      field: "groom",
      raw: overrides?.groomEmail ?? couple.groom_email,
    },
  ];

  for (const entry of entries) {
    const raw = entry.raw?.trim() ?? "";
    if (!raw) continue;

    const normalized = normalizeEmail(raw);
    if (!normalized || !isValidEmail(normalized)) {
      invalidEmails.push({ field: entry.field, email: raw });
      continue;
    }

    if (seen.has(normalized)) continue;
    seen.add(normalized);
    validEmails.push(normalized);
  }

  return { validEmails, invalidEmails };
}

export async function POST(request: Request) {
  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    console.error("[share-drive-folder] missing env:", missingEnv.join(", "));
    return NextResponse.json(
      { error: "Google Drive yapılandırması eksik." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as {
      coupleSlug?: string;
      brideEmail?: string;
      groomEmail?: string;
    };
    const coupleSlug = body.coupleSlug?.trim();

    if (!coupleSlug) {
      return NextResponse.json({ error: "coupleSlug gerekli." }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: couple, error } = await supabase
      .from("couples")
      .select(
        "id, slug, bride_email, groom_email, drive_folder_id, drive_folder_url"
      )
      .eq("slug", coupleSlug)
      .maybeSingle();

    if (error || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { validEmails, invalidEmails } = collectShareEmails(couple, {
      brideEmail: body.brideEmail,
      groomEmail: body.groomEmail,
    });

    if (validEmails.length === 0) {
      return NextResponse.json({
        success: true,
        sharedWith: [],
        alreadyShared: [],
        invalidEmails,
        driveFolderUrl: couple.drive_folder_url,
        warning:
          invalidEmails.length > 0
            ? "Geçerli e-posta bulunamadı; paylaşım yapılmadı."
            : undefined,
      });
    }

    const folder = await getOrCreateCoupleFolder(
      couple.slug,
      couple.drive_folder_id
    );

    assertCoupleFolderNotParent(folder.folderId);

    if (
      folder.created ||
      couple.drive_folder_id !== folder.folderId ||
      couple.drive_folder_url !== folder.folderUrl
    ) {
      await supabase
        .from("couples")
        .update({
          drive_folder_id: folder.folderId,
          drive_folder_url: folder.folderUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", couple.id);
    }

    const { sharedWith, alreadyShared } = await shareDriveFolderWithEmails(
      folder.folderId,
      validEmails
    );

    return NextResponse.json({
      success: true,
      sharedWith,
      alreadyShared,
      invalidEmails,
      driveFolderUrl: folder.folderUrl,
      warning:
        invalidEmails.length > 0
          ? "Bazı e-posta adresleri geçersiz; geçerli adreslerle paylaşım yapıldı."
          : undefined,
    });
  } catch (error) {
    console.error("[share-drive-folder]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Drive paylaşımı sırasında hata oluştu.",
      },
      { status: 500 }
    );
  }
}
