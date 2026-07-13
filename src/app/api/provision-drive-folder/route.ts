import { NextResponse } from "next/server";
import {
  getMissingDriveEnvVars,
  getOrCreateCoupleFolder,
  logDriveEnvCheck,
} from "@/lib/google/drive";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Creates (or finds) the couple's Google Drive folder and saves IDs on the couple row. */
export async function POST(request: Request) {
  logDriveEnvCheck();

  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: "Google Drive yapılandırması eksik." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as { coupleSlug?: string };
    const coupleSlug = body.coupleSlug?.trim();

    if (!coupleSlug) {
      return NextResponse.json({ error: "coupleSlug gerekli." }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: couple, error } = await supabase
      .from("couples")
      .select("id, slug, drive_folder_id, drive_folder_url")
      .eq("slug", coupleSlug)
      .maybeSingle();

    if (error || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const folder = await getOrCreateCoupleFolder(
      couple.slug,
      couple.drive_folder_id
    );

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

    return NextResponse.json({
      success: true,
      created: folder.created,
      driveFolderId: folder.folderId,
      driveFolderUrl: folder.folderUrl,
    });
  } catch (err) {
    console.error("[provision-drive-folder]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Drive klasörü oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}
