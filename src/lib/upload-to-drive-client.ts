/**
 * Client-only Drive upload helper.
 * No Google/Supabase service env reads — only POSTs to the API route.
 */
export async function uploadFileToDriveApi(
  file: File,
  coupleSlug: string,
  contributionId: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("coupleSlug", coupleSlug);
  formData.append("contributionId", contributionId);

  const response = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Drive yükleme başarısız.");
  }
}
