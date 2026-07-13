import { google } from "googleapis";
import { Readable } from "stream";
import { assertGoogleDriveConfigured } from "./drive-env";
import { DRIVE_SHARED_OPTS } from "./drive-shared-options";

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  mimeType: string;
  size: number;
  name: string;
}

export function getOAuth2Client() {
  assertGoogleDriveConfigured();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getOAuth2Client() });
}

export function getParentFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!id?.trim()) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID tanımlı değil.");
  }
  return id.trim();
}

export async function findCoupleFolderBySlug(
  slug: string,
  parentFolderId: string
): Promise<{ id: string; webViewLink: string | null } | null> {
  const drive = getDriveClient();
  const query = [
    `'${parentFolderId}' in parents`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${slug.replace(/'/g, "\\'")}'`,
  ].join(" and ");

  const { data } = await drive.files.list({
    q: query,
    fields: "files(id, webViewLink)",
    pageSize: 1,
    ...DRIVE_SHARED_OPTS,
  });

  const folder = data.files?.[0];
  if (!folder?.id) return null;

  return {
    id: folder.id,
    webViewLink: folder.webViewLink ?? null,
  };
}

export async function createCoupleFolder(
  slug: string,
  parentFolderId: string
): Promise<{ id: string; webViewLink: string | null }> {
  const drive = getDriveClient();

  const { data } = await drive.files.create({
    requestBody: {
      name: slug,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, webViewLink",
    ...DRIVE_SHARED_OPTS,
  });

  if (!data.id) {
    throw new Error("Drive klasörü oluşturulamadı.");
  }

  return {
    id: data.id,
    webViewLink: data.webViewLink ?? null,
  };
}

export async function getOrCreateCoupleFolder(
  slug: string,
  existingFolderId: string | null | undefined
): Promise<{ folderId: string; folderUrl: string | null; created: boolean }> {
  if (existingFolderId) {
    const drive = getDriveClient();
    try {
      const { data } = await drive.files.get({
        fileId: existingFolderId,
        fields: "id, webViewLink, trashed",
        ...DRIVE_SHARED_OPTS,
      });

      if (data.id && !data.trashed) {
        return {
          folderId: data.id,
          folderUrl: data.webViewLink ?? null,
          created: false,
        };
      }
    } catch {
      // Folder missing — recreate below
    }
  }

  const parentFolderId = getParentFolderId();
  const existing = await findCoupleFolderBySlug(slug, parentFolderId);
  if (existing) {
    return {
      folderId: existing.id,
      folderUrl: existing.webViewLink,
      created: false,
    };
  }

  const created = await createCoupleFolder(slug, parentFolderId);
  return {
    folderId: created.id,
    folderUrl: created.webViewLink,
    created: true,
  };
}

export async function uploadFileToDriveFolder(input: {
  folderId: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<DriveUploadResult> {
  const drive = getDriveClient();

  const { data } = await drive.files.create({
    requestBody: {
      name: input.filename,
      parents: [input.folderId],
    },
    media: {
      mimeType: input.mimeType,
      body: Readable.from(input.buffer),
    },
    fields: "id, webViewLink, mimeType, size, name",
    ...DRIVE_SHARED_OPTS,
  });

  if (!data.id) {
    throw new Error("Drive dosya yükleme başarısız.");
  }

  return {
    fileId: data.id,
    webViewLink: data.webViewLink ?? `https://drive.google.com/file/d/${data.id}/view`,
    mimeType: data.mimeType ?? input.mimeType,
    size: Number(data.size ?? input.buffer.length),
    name: data.name ?? input.filename,
  };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId, ...DRIVE_SHARED_OPTS });
}

export async function setDriveFilePublicRead(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    ...DRIVE_SHARED_OPTS,
  });
}

export function getDriveDirectImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function sanitizeUploadFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export { getMissingDriveEnvVars, isGoogleDriveConfigured, logDriveEnvCheck } from "./drive-env";
