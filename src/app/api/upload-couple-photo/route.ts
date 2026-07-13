import { NextResponse } from "next/server";
import {
  getMissingDriveEnvVars,
  getOrCreateCoupleFolder,
  logDriveEnvCheck,
  sanitizeUploadFilename,
  setDriveFilePublicRead,
  uploadFileToDriveFolder,
  getDriveDirectImageUrl,
} from "@/lib/google/drive";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isPlaceholderCoupleId } from "@/lib/supabase/couples";
import { MAX_COUPLE_GALLERY_PHOTOS } from "@/lib/supabase/constants";
import {
  formatCoupleGalleryUploadError,
  isCoupleGalleryMigrationError,
} from "@/lib/couple-gallery-migration";
import {
  getMaxUploadBytes,
  isAllowedGalleryImageMimeType,
} from "@/lib/upload-validation";
import { parseFrameCropFromForm } from "@/lib/memories-frame-crop";

export const runtime = "nodejs";

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
    const formData = await request.formData();
    const file = formData.get("file");
    const coupleSlug = String(formData.get("coupleSlug") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }

    if (!coupleSlug) {
      return NextResponse.json({ error: "coupleSlug gerekli." }, { status: 400 });
    }

    if (!isAllowedGalleryImageMimeType(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG veya WebP yükleyebilirsiniz." },
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

    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select("id, slug, drive_folder_id, drive_folder_url")
      .eq("slug", coupleSlug)
      .maybeSingle();

    if (coupleError || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    if (isPlaceholderCoupleId(couple.id)) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { count: existingCount, error: countError } = await supabase
      .from("couple_photos")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", couple.id);

    if (countError) {
      return NextResponse.json(
        { error: "Fotoğraf sayısı kontrol edilemedi." },
        { status: 500 }
      );
    }

    if ((existingCount ?? 0) >= MAX_COUPLE_GALLERY_PHOTOS) {
      return NextResponse.json(
        { error: `En fazla ${MAX_COUPLE_GALLERY_PHOTOS} fotoğraf yüklenebilir.` },
        { status: 400 }
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
    const uniqueName = `gallery-${crypto.randomUUID()}-${safeName}`;

    const uploaded = await uploadFileToDriveFolder({
      folderId: folder.folderId,
      buffer,
      filename: uniqueName,
      mimeType: file.type,
    });

    await setDriveFilePublicRead(uploaded.fileId).catch(() => {
      /* may already be public */
    });

    const imageUrl = getDriveDirectImageUrl(uploaded.fileId);
    const sortOrder = existingCount ?? 0;
    const frameCrop = parseFrameCropFromForm(formData);

    const { data: photoRow, error: photoError } = await supabase
      .from("couple_photos")
      .insert({
        couple_id: couple.id,
        sort_order: sortOrder,
        provider: "google_drive",
        drive_file_id: uploaded.fileId,
        drive_folder_id: folder.folderId,
        drive_web_view_link: uploaded.webViewLink,
        image_url: imageUrl,
        filename: file.name,
        file_size: uploaded.size,
        mime_type: uploaded.mimeType,
        frame_zoom: frameCrop.zoom,
        frame_pan_x: frameCrop.panX,
        frame_pan_y: frameCrop.panY,
      })
      .select("*")
      .single();

    if (photoError || !photoRow) {
      const raw = photoError?.message ?? "Fotoğraf kaydı oluşturulamadı.";
      return NextResponse.json(
        {
          error: formatCoupleGalleryUploadError(raw),
          migrationRequired: isCoupleGalleryMigrationError(raw),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photoRow.id,
        imageUrl: photoRow.image_url,
        filename: photoRow.filename,
        sortOrder: photoRow.sort_order,
      },
    });
  } catch (error) {
    console.error("[upload-couple-photo]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fotoğraf yükleme sırasında hata oluştu.",
      },
      { status: 500 }
    );
  }
}
