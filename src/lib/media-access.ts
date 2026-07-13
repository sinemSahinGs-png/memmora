import { getDriveClient, getMissingDriveEnvVars } from "@/lib/google/drive";
import { DRIVE_SHARED_OPTS } from "@/lib/google/drive-shared-options";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { DbContributionMedia } from "@/lib/supabase/database.types";

export type AuthorizedMedia = DbContributionMedia & {
  guest_name: string;
  contribution_created_at: string;
  couple_id: string;
};

export function getMediaDownloadFilename(media: DbContributionMedia): string {
  const name = media.filename?.trim() || media.file_name?.trim() || "memoora-ani";
  return name.replace(/[/\\?%*:|"<>]/g, "_");
}

export async function authorizeContributionMedia(
  mediaId: string,
  coupleSlug: string | null,
  options?: { superAdmin?: boolean }
): Promise<{ media: AuthorizedMedia } | { error: string; status: number }> {
  if (!mediaId.trim()) {
    return { error: "Medya bulunamadı.", status: 400 };
  }

  const supabase = createServiceRoleClient();

  const { data: row, error } = await supabase
    .from("contribution_media")
    .select(
      `
        *,
        contributions!inner (
          couple_id,
          guest_name,
          created_at,
          is_visible
        )
      `
    )
    .eq("id", mediaId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !row) {
    return { error: "Medya bulunamadı.", status: 404 };
  }

  const contribution = row.contributions as {
    couple_id: string;
    guest_name: string;
    created_at: string;
    is_visible: boolean;
  };

  if (!contribution.is_visible || row.hidden) {
    return { error: "Medya bulunamadı.", status: 404 };
  }

  if (!options?.superAdmin) {
    const slug = coupleSlug?.trim();
    if (!slug) {
      return { error: "Erişim reddedildi.", status: 403 };
    }

    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (coupleError || !couple || couple.id !== contribution.couple_id) {
      return { error: "Medya bulunamadı.", status: 404 };
    }
  }

  const driveFileId = row.drive_file_id?.trim();
  if (!driveFileId) {
    return { error: "Medya dosyası bulunamadı.", status: 404 };
  }

  const { contributions: _c, ...media } = row;

  return {
    media: {
      ...(media as DbContributionMedia),
      guest_name: contribution.guest_name,
      contribution_created_at: contribution.created_at,
      couple_id: contribution.couple_id,
    },
  };
}

export async function fetchDriveMediaBuffer(fileId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    throw new Error("Google Drive yapılandırması eksik.");
  }

  const drive = getDriveClient();

  const meta = await drive.files.get({
    fileId,
    fields: "mimeType",
    ...DRIVE_SHARED_OPTS,
  });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" }
  );

  return {
    buffer: Buffer.from(response.data as ArrayBuffer),
    mimeType: meta.data.mimeType || "application/octet-stream",
  };
}
