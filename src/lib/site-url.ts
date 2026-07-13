/** Default when NEXT_PUBLIC_SITE_URL is unset (local dev). */
export const DEFAULT_SITE_URL = "http://localhost:3000";

/** Base URL for public/admin links (no trailing slash). */
export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return DEFAULT_SITE_URL;
}

export function buildCouplePublicUrl(slug: string): string {
  return `${getSiteBaseUrl()}/${slug.trim()}`;
}

export function buildCoupleAdminUrl(slug: string): string {
  return `${getSiteBaseUrl()}/${slug.trim()}/admin`;
}

export function buildCoupleInviteUrl(slug: string): string {
  return `${getSiteBaseUrl()}/${slug.trim()}/invite`;
}

export function buildCoupleQuizUrl(slug: string): string {
  return `${getSiteBaseUrl()}/${slug.trim()}/quiz`;
}

/** Always derive links from slug + NEXT_PUBLIC_SITE_URL (ignores stale stored URLs). */
export function resolveCoupleUrls(slug: string): {
  publicUrl: string;
  adminUrl: string;
  inviteUrl: string;
  quizUrl: string;
} {
  return {
    publicUrl: buildCouplePublicUrl(slug),
    adminUrl: buildCoupleAdminUrl(slug),
    inviteUrl: buildCoupleInviteUrl(slug),
    quizUrl: buildCoupleQuizUrl(slug),
  };
}
