export interface ShareDriveInvalidEmail {
  field: "bride" | "groom";
  email: string;
}

export interface ShareDriveFolderResult {
  ok: boolean;
  sharedWith?: string[];
  alreadyShared?: string[];
  invalidEmails?: ShareDriveInvalidEmail[];
  driveFolderUrl?: string;
  error?: string;
  warning?: string;
}

export async function shareCoupleDriveFolder(
  coupleSlug: string,
  emails?: { brideEmail?: string; groomEmail?: string }
): Promise<ShareDriveFolderResult> {
  try {
    const response = await fetch("/api/share-drive-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleSlug,
        brideEmail: emails?.brideEmail,
        groomEmail: emails?.groomEmail,
      }),
    });

    const payload = (await response.json()) as ShareDriveFolderResult & {
      success?: boolean;
    };

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? "Drive paylaşımı başarısız.",
        invalidEmails: payload.invalidEmails,
        warning: payload.warning,
      };
    }

    return {
      ok: true,
      sharedWith: payload.sharedWith ?? [],
      alreadyShared: payload.alreadyShared ?? [],
      invalidEmails: payload.invalidEmails ?? [],
      driveFolderUrl: payload.driveFolderUrl,
      warning: payload.warning,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Drive paylaşımı başarısız.",
    };
  }
}

export function formatShareSaveMessage(
  share: ShareDriveFolderResult | null,
  hasEmails: boolean,
  entityLabel = "Ayarlar",
  savedVerb = "kaydedildi"
): string {
  if (!hasEmails) return `${entityLabel} ${savedVerb}.`;

  if (!share?.ok) {
    return `${entityLabel} ${savedVerb} ancak Drive paylaşımı yapılamadı.`;
  }

  if (share.invalidEmails?.length) {
    const invalidList = share.invalidEmails
      .map((item) =>
        item.field === "bride"
          ? `Gelin: ${item.email}`
          : `Damat: ${item.email}`
      )
      .join(", ");
    return `${entityLabel} ${savedVerb}. Geçersiz e-posta: ${invalidList}`;
  }

  const sharedCount =
    (share.sharedWith?.length ?? 0) + (share.alreadyShared?.length ?? 0);

  if (sharedCount > 0) {
    return `${entityLabel} ${savedVerb}. Drive klasörü gelin/damat ile paylaşıldı.`;
  }

  return `${entityLabel} ${savedVerb}.`;
}

export function formatManualShareMessage(share: ShareDriveFolderResult): string {
  if (!share.ok) {
    return share.error ?? "Drive paylaşımı başarısız.";
  }

  if (share.invalidEmails?.length) {
    const invalidList = share.invalidEmails
      .map((item) =>
        item.field === "bride"
          ? `Gelin: ${item.email}`
          : `Damat: ${item.email}`
      )
      .join(", ");
    return `Geçersiz e-posta: ${invalidList}`;
  }

  const parts: string[] = [];
  if (share.sharedWith?.length) {
    parts.push(`Paylaşıldı: ${share.sharedWith.join(", ")}`);
  }
  if (share.alreadyShared?.length) {
    parts.push(`Zaten paylaşılmış: ${share.alreadyShared.join(", ")}`);
  }

  if (parts.length > 0) return parts.join(" · ");
  return "Paylaşılacak geçerli e-posta bulunamadı.";
}
