import {
  deleteDriveFile,
  getDriveClient,
  getOrCreateCoupleFolder,
  sanitizeUploadFilename,
  uploadFileToDriveFolder,
} from "@/lib/google/drive";
import { DRIVE_SHARED_OPTS } from "@/lib/google/drive-shared-options";
import { isGoogleDriveConfigured } from "@/lib/google/drive-env";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface AftermovieStoredObject {
  storageKey: string;
  mimeType: string;
  size: number;
  name: string;
}

/**
 * Permanent aftermovie output storage.
 * Preference: Google Drive (already production-wired) via stable file IDs.
 * Playback is always through app proxies — never store temporary signed URLs.
 */
export interface AftermovieOutputStorage {
  readonly name: string;
  uploadVideo(input: {
    coupleSlug: string;
    buffer: Buffer;
    filename: string;
    mimeType?: string;
  }): Promise<AftermovieStoredObject>;
  uploadPoster(input: {
    coupleSlug: string;
    buffer: Buffer;
    filename: string;
    mimeType?: string;
  }): Promise<AftermovieStoredObject>;
  deleteVideo(storageKey: string): Promise<void>;
  deletePoster(storageKey: string): Promise<void>;
  /** Logical app path helper — callers build public routes. */
  getPlaybackUrl(coupleSlug: string): string;
  getDownloadUrl(coupleSlug: string): string;
}

async function ensureAftermovieFolder(coupleSlug: string): Promise<string> {
  const client = createServiceRoleClient();
  const { data: couple } = await client
    .from("couples")
    .select("drive_folder_id")
    .eq("slug", coupleSlug)
    .is("deleted_at", null)
    .maybeSingle();

  const coupleFolder = await getOrCreateCoupleFolder(
    coupleSlug,
    couple?.drive_folder_id ?? null,
  );

  if (couple?.drive_folder_id !== coupleFolder.folderId) {
    await client
      .from("couples")
      .update({
        drive_folder_id: coupleFolder.folderId,
        drive_folder_url: coupleFolder.folderUrl,
      })
      .eq("slug", coupleSlug);
  }

  const drive = getDriveClient();
  const folderName = "memoora-after";
  const query = [
    `'${coupleFolder.folderId}' in parents`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${folderName}'`,
  ].join(" and ");

  const found = await drive.files.list({
    q: query,
    fields: "files(id)",
    pageSize: 1,
    ...DRIVE_SHARED_OPTS,
  });
  const existing = found.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [coupleFolder.folderId],
    },
    fields: "id",
    ...DRIVE_SHARED_OPTS,
  });
  if (!created.data.id) {
    throw new Error("Aftermovie Drive klasörü oluşturulamadı.");
  }
  return created.data.id;
}

export class DriveAftermovieOutputStorage implements AftermovieOutputStorage {
  readonly name = "google-drive";

  getPlaybackUrl(coupleSlug: string): string {
    return `/api/aftermovie/${encodeURIComponent(coupleSlug)}/playback`;
  }

  getDownloadUrl(coupleSlug: string): string {
    return `/api/aftermovie/${encodeURIComponent(coupleSlug)}/playback?download=1`;
  }

  async uploadVideo(input: {
    coupleSlug: string;
    buffer: Buffer;
    filename: string;
    mimeType?: string;
  }): Promise<AftermovieStoredObject> {
    if (!isGoogleDriveConfigured()) {
      throw new Error("Google Drive yapılandırılmadı.");
    }
    const folderId = await ensureAftermovieFolder(input.coupleSlug);
    const uploaded = await uploadFileToDriveFolder({
      folderId,
      buffer: input.buffer,
      filename: sanitizeUploadFilename(input.filename),
      mimeType: input.mimeType ?? "video/mp4",
    });
    return {
      storageKey: uploaded.fileId,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      name: uploaded.name,
    };
  }

  async uploadPoster(input: {
    coupleSlug: string;
    buffer: Buffer;
    filename: string;
    mimeType?: string;
  }): Promise<AftermovieStoredObject> {
    if (!isGoogleDriveConfigured()) {
      throw new Error("Google Drive yapılandırılmadı.");
    }
    const folderId = await ensureAftermovieFolder(input.coupleSlug);
    const uploaded = await uploadFileToDriveFolder({
      folderId,
      buffer: input.buffer,
      filename: sanitizeUploadFilename(input.filename),
      mimeType: input.mimeType ?? "image/jpeg",
    });
    return {
      storageKey: uploaded.fileId,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      name: uploaded.name,
    };
  }

  async deleteVideo(storageKey: string): Promise<void> {
    if (!storageKey.trim()) return;
    await deleteDriveFile(storageKey);
  }

  async deletePoster(storageKey: string): Promise<void> {
    if (!storageKey.trim()) return;
    await deleteDriveFile(storageKey);
  }
}

/** External HTTPS registration — stores URL as playback reference, no Drive key. */
export class ExternalUrlAftermovieOutputStorage implements AftermovieOutputStorage {
  readonly name = "external-url";

  getPlaybackUrl(coupleSlug: string): string {
    return `/api/aftermovie/${encodeURIComponent(coupleSlug)}/playback`;
  }

  getDownloadUrl(coupleSlug: string): string {
    return this.getPlaybackUrl(coupleSlug);
  }

  async uploadVideo(): Promise<AftermovieStoredObject> {
    throw new Error("External URL storage does not upload buffers.");
  }

  async uploadPoster(): Promise<AftermovieStoredObject> {
    throw new Error("External URL storage does not upload buffers.");
  }

  async deleteVideo(): Promise<void> {
    /* external assets are not deleted by Memoora */
  }

  async deletePoster(): Promise<void> {
    /* external assets are not deleted by Memoora */
  }
}

export function getAftermovieOutputStorage(): AftermovieOutputStorage {
  if (isGoogleDriveConfigured()) {
    return new DriveAftermovieOutputStorage();
  }
  // Fallback interface for registering external URLs only
  return new ExternalUrlAftermovieOutputStorage();
}
