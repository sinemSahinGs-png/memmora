export type PaytrCredentials = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
};

export function getPaytrCredentials(): PaytrCredentials | null {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim() ?? "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim() ?? "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim() ?? "";

  if (!merchantId || !merchantKey || !merchantSalt) {
    return null;
  }

  return { merchantId, merchantKey, merchantSalt };
}

export function isPaytrConfigured(): boolean {
  return getPaytrCredentials() != null;
}

export function getPaytrMissingEnvKeys(): string[] {
  const keys = [
    "PAYTR_MERCHANT_ID",
    "PAYTR_MERCHANT_KEY",
    "PAYTR_MERCHANT_SALT",
  ] as const;
  return keys.filter((key) => !process.env[key]?.trim());
}

/** "1" = test, "0" = live. Defaults to test unless explicitly set to 0. */
export function getPaytrTestMode(): "0" | "1" {
  return process.env.PAYTR_TEST_MODE?.trim() === "0" ? "0" : "1";
}

export function getPaytrDebugOn(): "0" | "1" {
  return process.env.PAYTR_DEBUG_ON?.trim() === "1" ? "1" : "0";
}

export function getSiteUrl(requestOrigin?: string): string {
  const fromEnv =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`;
  }

  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "127.0.0.1";
}
