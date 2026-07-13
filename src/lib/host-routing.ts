const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const PRIVATE_IPV4_PATTERNS = [
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MEMOORA_APEX_HOST = "memoora.com.tr";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "memoora",
  "admin",
  "api",
  "app",
]);

/** Strip port and normalize case from Host header or window.location.hostname. */
export function normalizeHostname(host: string): string {
  return host.split(":")[0].trim().toLowerCase();
}

/** localhost, 127.0.0.1, ::1 and private LAN IPs — path routing only. */
export function isLocalDevHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (LOCAL_HOSTNAMES.has(host)) return true;
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(host));
}

/** Production Memoora hosts that may use subdomain → slug routing. */
export function isProductionSubdomainHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (isLocalDevHost(host)) return false;
  return host === MEMOORA_APEX_HOST || host.endsWith(`.${MEMOORA_APEX_HOST}`);
}

/**
 * berkin-beste.memoora.com.tr → berkin-beste
 * Returns null for apex / reserved / local hosts.
 */
export function extractCoupleSlugFromHost(hostname: string): string | null {
  const host = normalizeHostname(hostname);
  if (!isProductionSubdomainHost(host)) return null;
  if (host === MEMOORA_APEX_HOST || host === `www.${MEMOORA_APEX_HOST}`) {
    return null;
  }

  if (!host.endsWith(`.${MEMOORA_APEX_HOST}`)) return null;

  const slug = host.slice(0, -(`.${MEMOORA_APEX_HOST}`.length));
  if (!slug || slug.includes(".") || RESERVED_SUBDOMAINS.has(slug) || !SLUG_PATTERN.test(slug)) {
    return null;
  }

  return slug;
}
