export function getMediaViewUrl(mediaId: string, coupleSlug: string): string {
  const params = new URLSearchParams({ coupleSlug });
  return `/api/media/view/${encodeURIComponent(mediaId)}?${params.toString()}`;
}

export function getMediaDownloadUrl(mediaId: string, coupleSlug: string): string {
  const params = new URLSearchParams({ coupleSlug });
  return `/api/media/download/${encodeURIComponent(mediaId)}?${params.toString()}`;
}

export function getMediaDownloadAllUrl(coupleSlug: string): string {
  return `/api/media/download-all/${encodeURIComponent(coupleSlug)}`;
}
