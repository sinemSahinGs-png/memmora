export async function provisionCoupleDriveFolder(coupleSlug: string): Promise<{
  ok: boolean;
  created?: boolean;
  driveFolderUrl?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/provision-drive-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupleSlug }),
    });

    const payload = (await response.json()) as {
      error?: string;
      created?: boolean;
      driveFolderUrl?: string;
    };

    if (!response.ok) {
      return { ok: false, error: payload.error ?? "Drive klasörü oluşturulamadı." };
    }

    return {
      ok: true,
      created: payload.created,
      driveFolderUrl: payload.driveFolderUrl,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Drive klasörü oluşturulamadı.",
    };
  }
}
