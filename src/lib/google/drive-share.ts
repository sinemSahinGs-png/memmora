import type { drive_v3 } from "googleapis";
import { getDriveClient, getParentFolderId } from "./drive";
import { DRIVE_SHARED_OPTS } from "./drive-shared-options";

export interface ShareDriveEmailsResult {
  sharedWith: string[];
  alreadyShared: string[];
}

function isDuplicatePermissionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string; message?: string }>;
  };

  if (err.code === 409) return true;

  const message = String(err.message ?? "").toLowerCase();
  if (message.includes("already") && message.includes("permission")) return true;

  return (
    err.errors?.some(
      (item) =>
        item.reason === "duplicate" ||
        String(item.message ?? "").toLowerCase().includes("already exists")
    ) ?? false
  );
}

/** Never share the Memoora Uploads root — only per-couple folders. */
export function assertCoupleFolderNotParent(folderId: string): void {
  const parentId = getParentFolderId();
  if (folderId === parentId) {
    throw new Error("Güvenlik: üst Drive klasörü paylaşılamaz.");
  }
}

async function shareOneEmail(
  drive: drive_v3.Drive,
  folderId: string,
  email: string
): Promise<"shared" | "already"> {
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        role: "reader",
        type: "user",
        emailAddress: email,
      },
      sendNotificationEmail: false,
      ...DRIVE_SHARED_OPTS,
    });
    return "shared";
  } catch (error) {
    if (isDuplicatePermissionError(error)) return "already";
    throw error;
  }
}

export async function shareDriveFolderWithEmails(
  folderId: string,
  emails: string[]
): Promise<ShareDriveEmailsResult> {
  assertCoupleFolderNotParent(folderId);

  const drive = getDriveClient();
  const sharedWith: string[] = [];
  const alreadyShared: string[] = [];
  const seen = new Set<string>();

  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);

    const outcome = await shareOneEmail(drive, folderId, email);
    if (outcome === "shared") {
      sharedWith.push(email);
    } else {
      alreadyShared.push(email);
    }
  }

  return { sharedWith, alreadyShared };
}
