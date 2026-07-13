import { NextResponse } from "next/server";
import {
  getMissingDriveEnvVars,
  getOrCreateCoupleFolder,
  logDriveEnvCheck,
  sanitizeUploadFilename,
  uploadFileToDriveFolder,
} from "@/lib/google/drive";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isPlaceholderCoupleId } from "@/lib/supabase/couples";
import {
  getMaxUploadBytes,
  isAllowedMimeType,
} from "@/lib/upload-validation";

export const runtime = "nodejs";

// TODO: Add rate limiting (e.g. Upstash / Vercel KV) per IP + coupleSlug.

export async function POST(request: Request) {
  console.log("[upload-to-drive] request received");
  logDriveEnvCheck();

  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    console.error("[upload-to-drive] missing env:", missingEnv.join(", "));
    return NextResponse.json(
      { error: "Google Drive yapılandırması eksik." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const coupleSlug = String(formData.get("coupleSlug") ?? "").trim();
    const contributionId = String(formData.get("contributionId") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }

    if (!coupleSlug || !contributionId) {
      return NextResponse.json(
        { error: "coupleSlug ve contributionId gerekli." },
        { status: 400 }
      );
    }

    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü." },
        { status: 400 }
      );
    }

    if (file.size > getMaxUploadBytes()) {
      return NextResponse.json(
        { error: "Dosya boyutu sınırı aşıldı." },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: contribution, error: contributionError } = await supabase
      .from("contributions")
      .select("id, couple_id")
      .eq("id", contributionId)
      .maybeSingle();

    if (contributionError || !contribution) {
      return NextResponse.json(
        { error: "Anı kaydı bulunamadı." },
        { status: 404 }
      );
    }

    if (isPlaceholderCoupleId(contribution.couple_id)) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select(
        "id, slug, drive_folder_id, drive_folder_url, media_upload_enabled"
      )
      .eq("id", contribution.couple_id)
      .maybeSingle();

    if (coupleError || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    if (couple.slug !== coupleSlug) {
      return NextResponse.json(
        { error: "Anı kaydı bu çifle eşleşmiyor." },
        { status: 403 }
      );
    }

    if (couple.media_upload_enabled === false) {
      return NextResponse.json(
        { error: "Bu çift için medya yükleme kapalı." },
        { status: 403 }
      );
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeUploadFilename(file.name);
    const uniqueName = `${crypto.randomUUID()}-${safeName}`;

    const uploaded = await uploadFileToDriveFolder({
      folderId: folder.folderId,
      buffer,
      filename: uniqueName,
      mimeType: file.type,
    });

    const { data: mediaRow, error: mediaError } = await supabase
      .from("contribution_media")
      .insert({
        contribution_id: contributionId,
        file_url: uploaded.webViewLink,
        file_type: uploaded.mimeType,
        file_name: file.name,
        provider: "google_drive",
        drive_file_id: uploaded.fileId,
        drive_folder_id: folder.folderId,
        drive_web_view_link: uploaded.webViewLink,
        filename: file.name,
        file_size: uploaded.size,
        mime_type: uploaded.mimeType,
      })
      .select("id, drive_file_id, drive_web_view_link, file_url")
      .single();

    if (mediaError || !mediaRow) {
      return NextResponse.json(
        { error: mediaError?.message ?? "Medya kaydı oluşturulamadı." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      driveFileId: uploaded.fileId,
      webViewLink: uploaded.webViewLink,
      mediaId: mediaRow.id,
    });
  } catch (error) {
    console.error("[upload-to-drive]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Drive yükleme sırasında hata oluştu.",
      },
      { status: 500 }
    );
  }
}
