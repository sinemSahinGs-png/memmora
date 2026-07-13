export function getMediaViewUrl(mediaId: string, coupleSlug: string): string {
  const params = new URLSearchParams({ coupleSlug });
  return `/api/media/view/${encodeURIComponent(mediaId)}?${params.toString()}`;
}

export function getMediaDownloadUrl(mediaId: string, coupleSlug: string): string {
  const params = new URLSearchParams({ coupleSlug });
  return `/api/media/download/${encodeURIComponent(mediaId)}?${params.toString()}`;
}

export function getMediaDownloadAllUrl(
  coupleSlug: string,
  options?: { superAdmin?: boolean }
): string {
  const params = new URLSearchParams();
  if (options?.superAdmin) {
    params.set("superAdmin", "1");
  }
  const query = params.toString();
  const base = `/api/media/download-all/${encodeURIComponent(coupleSlug)}`;
  return query ? `${base}?${query}` : base;
}
