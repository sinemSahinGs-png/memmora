const SESSION_PREFIX = "memoora:admin-auth:";

export function getCoupleAdminSessionKey(slug: string): string {
  return `${SESSION_PREFIX}couple:${slug.trim()}`;
}

export function getSuperAdminSessionKey(): string {
  return `${SESSION_PREFIX}super`;
}

export function isAdminSessionActive(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function setAdminSessionActive(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAdminSession(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
