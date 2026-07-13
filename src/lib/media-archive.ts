import { ZipArchive } from "archiver";
import { PassThrough } from "node:stream";
import {
  authorizeContributionMedia,
  fetchDriveMediaBuffer,
  type AuthorizedMedia,
} from "@/lib/media-access";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { DbContributionMedia } from "@/lib/supabase/database.types";

export const MAX_BULK_DOWNLOAD_MEDIA = 50;

export interface GalleryArchiveMedia extends DbContributionMedia {
  guest_name: string;
  contribution_created_at: string;
  couple_id: string;
}

export async function authorizeCoupleGalleryAccess(
  coupleSlug: string | null,
  options?: { superAdmin?: boolean }
): Promise<
  { couple: { id: string; slug: string } } | { error: string; status: number }
> {
  const slug = coupleSlug?.trim();
  if (!options?.superAdmin && !slug) {
    return { error: "Erişim reddedildi.", status: 403 };
  }

  const supabase = createServiceRoleClient();
  let query = supabase.from("couples").select("id, slug");

  if (slug) {
    query = query.eq("slug", slug);
  }

  const { data: couple, error } = await query.maybeSingle();

  if (error || !couple) {
    return { error: "Çift bulunamadı.", status: 404 };
  }

  return { couple };
}

export async function fetchCoupleGalleryMedia(
  coupleId: string
): Promise<GalleryArchiveMedia[]> {
  const supabase = createServiceRoleClient();

  const { data: contributions, error } = await supabase
    .from("contributions")
    .select(
      `
        guest_name,
        created_at,
        is_visible,
        contribution_media (*)
      `
    )
    .eq("couple_id", coupleId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Galeri medyası yüklenemedi.");
  }

  const rows: GalleryArchiveMedia[] = [];

  for (const contribution of contributions ?? []) {
    for (const media of contribution.contribution_media ?? []) {
      const row = media as DbContributionMedia;
      if (row.hidden || row.deleted_at) continue;
      if (!row.drive_file_id?.trim()) continue;

      rows.push({
        ...row,
        guest_name: contribution.guest_name,
        contribution_created_at: contribution.created_at,
        couple_id: coupleId,
      });
    }
  }

  return rows.sort(
    (a, b) =>
      new Date(b.contribution_created_at).getTime() -
      new Date(a.contribution_created_at).getTime()
  );
}

export function sanitizeGuestSlug(name: string): string {
  const base = name.trim() || "misafir";
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);

  return slug || "misafir";
}

export function formatZipDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getZipFileExtension(
  media: DbContributionMedia,
  mimeType: string
): string {
  const fromName = media.filename?.trim() || media.file_name?.trim();
  if (fromName?.includes(".")) {
    const ext = fromName.split(".").pop()?.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }

  if (mimeType.startsWith("image/jpeg")) return "jpg";
  if (mimeType.startsWith("image/png")) return "png";
  if (mimeType.startsWith("image/webp")) return "webp";
  if (mimeType.startsWith("video/mp4")) return "mp4";
  if (mimeType.startsWith("video/quicktime")) return "mov";
  return "bin";
}

export function buildZipEntryPath(
  coupleSlug: string,
  media: GalleryArchiveMedia,
  sequence: number,
  mimeType: string
): string {
  const root = `Memoora-${coupleSlug}-Galeri`;
  const isVideo = mimeType.startsWith("video/");
  const folder = isVideo ? "Videolar" : "Fotograflar";
  const date = formatZipDate(media.contribution_created_at);
  const guest = sanitizeGuestSlug(media.guest_name);
  const ext = getZipFileExtension(media, mimeType);
  const filename = `${date}_${guest}_${String(sequence).padStart(3, "0")}.${ext}`;
  return `${root}/${folder}/${filename}`;
}

export async function buildCoupleGalleryZip(
  coupleSlug: string,
  mediaItems: GalleryArchiveMedia[]
): Promise<Buffer> {
  const archive = new ZipArchive({ zlib: { level: 6 } });
  const passThrough = new PassThrough();
  const chunks: Buffer[] = [];

  passThrough.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  archive.pipe(passThrough);

  const photoSeq = { value: 0 };
  const videoSeq = { value: 0 };

  for (const media of mediaItems) {
    const fileId = media.drive_file_id?.trim();
    if (!fileId) continue;

    const { buffer, mimeType } = await fetchDriveMediaBuffer(fileId);
    const resolvedMime = media.mime_type?.trim() || mimeType;
    const isVideo = resolvedMime.startsWith("video/");
    const sequence = isVideo ? ++videoSeq.value : ++photoSeq.value;
    const entryPath = buildZipEntryPath(
      coupleSlug,
      media,
      sequence,
      resolvedMime
    );
    archive.append(buffer, { name: entryPath });
  }

  await archive.finalize();

  await new Promise<void>((resolve, reject) => {
    passThrough.on("finish", () => resolve());
    passThrough.on("error", reject);
    archive.on("error", reject);
  });

  return Buffer.concat(chunks);
}

export { authorizeContributionMedia, fetchDriveMediaBuffer };
export type { AuthorizedMedia };
