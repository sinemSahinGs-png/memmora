import { getDriveClient, getMissingDriveEnvVars } from "@/lib/google/drive";
import { DRIVE_SHARED_OPTS } from "@/lib/google/drive-shared-options";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { DbContributionMedia } from "@/lib/supabase/database.types";
import {
  readCoupleAdminSession,
  readSuperAdminSession,
} from "@/lib/auth/admin-session-cookie";

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
      `,
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

  const superOk = (await readSuperAdminSession()) != null;
  if (!superOk) {
    const slug = coupleSlug?.trim();
    if (!slug) {
      return { error: "Erişim reddedildi.", status: 403 };
    }

    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select("id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (coupleError || !couple || couple.id !== contribution.couple_id) {
      return { error: "Medya bulunamadı.", status: 404 };
    }

    // Public gallery access by slug is allowed for visible media.
    // Couple-admin cookie is optional for private overrides later.
    void (await readCoupleAdminSession());
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
    fields: "mimeType,size",
    ...DRIVE_SHARED_OPTS,
  });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" },
  );

  return {
    buffer: Buffer.from(response.data as ArrayBuffer),
    mimeType: meta.data.mimeType || "application/octet-stream",
  };
}

export type DriveMediaRangeResult = {
  body: Buffer;
  status: 200 | 206;
  mimeType: string;
  size: number;
  contentRange?: string;
};

function parseBytesRange(
  rangeHeader: string | null,
  size: number,
): { start: number; end: number } | null {
  if (!rangeHeader || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;

  const startRaw = match[1];
  const endRaw = match[2];

  let start = startRaw === "" ? NaN : Number(startRaw);
  let end = endRaw === "" ? NaN : Number(endRaw);

  if (Number.isNaN(start) && Number.isNaN(end)) return null;

  // suffix range: bytes=-500
  if (Number.isNaN(start)) {
    const suffix = end;
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    if (!Number.isFinite(start) || start < 0 || start >= size) return null;
    end = Number.isNaN(end) ? size - 1 : Math.min(end, size - 1);
    if (end < start) return null;
  }

  return { start, end };
}

/**
 * Fetch Drive media with optional HTTP Range support for mobile Safari video.
 * Falls back to a sliced full download if Drive rejects partial requests.
 */
export async function fetchDriveMediaRange(
  fileId: string,
  rangeHeader: string | null,
): Promise<DriveMediaRangeResult> {
  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    throw new Error("Google Drive yapılandırması eksik.");
  }

  const drive = getDriveClient();
  const meta = await drive.files.get({
    fileId,
    fields: "mimeType,size",
    ...DRIVE_SHARED_OPTS,
  });

  const mimeType = meta.data.mimeType || "application/octet-stream";
  const size = Number(meta.data.size || 0);
  const range = parseBytesRange(rangeHeader, size);

  if (!range || size <= 0) {
    const full = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );
    const buffer = Buffer.from(full.data as ArrayBuffer);
    return {
      body: buffer,
      status: 200,
      mimeType,
      size: size || buffer.length,
    };
  }

  const { start, end } = range;
  const rangeValue = `bytes=${start}-${end}`;

  try {
    const partial = await drive.files.get(
      { fileId, alt: "media" },
      {
        responseType: "arraybuffer",
        headers: { Range: rangeValue },
      },
    );
    const body = Buffer.from(partial.data as ArrayBuffer);
    return {
      body,
      status: 206,
      mimeType,
      size,
      contentRange: `bytes ${start}-${start + body.length - 1}/${size}`,
    };
  } catch {
    // Some Drive responses reject Range — download once and slice.
    const full = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );
    const buffer = Buffer.from(full.data as ArrayBuffer);
    const slice = buffer.subarray(start, end + 1);
    return {
      body: slice,
      status: 206,
      mimeType,
      size: size || buffer.length,
      contentRange: `bytes ${start}-${start + slice.length - 1}/${size || buffer.length}`,
    };
  }
}

export function buildMediaStreamHeaders(options: {
  mimeType: string;
  size: number;
  status: 200 | 206;
  contentRange?: string;
  cacheControl: string;
  contentDisposition?: string;
  bodyLength: number;
}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": options.mimeType,
    "Accept-Ranges": "bytes",
    "Content-Length": String(options.bodyLength),
    "Cache-Control": options.cacheControl,
    "Content-Disposition": options.contentDisposition ?? "inline",
  };
  if (options.status === 206 && options.contentRange) {
    headers["Content-Range"] = options.contentRange;
  }
  return headers;
}
