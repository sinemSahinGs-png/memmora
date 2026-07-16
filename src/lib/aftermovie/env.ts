export type AftermovieProviderMode = "manual" | "mock" | "remotion";

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getConfiguredAftermovieProviderMode(): AftermovieProviderMode {
  const raw = (process.env.AFTERMOVIE_RENDER_PROVIDER ?? "").trim().toLowerCase();
  if (raw === "manual" || raw === "mock" || raw === "remotion") return raw;
  // Default: manual in production, mock only in development when unset
  return isProductionRuntime() ? "manual" : "mock";
}

export function assertAftermovieEnvForProvider(): AftermovieProviderMode {
  const mode = getConfiguredAftermovieProviderMode();

  if (isProductionRuntime()) {
    if (mode === "mock") {
      throw new Error(
        "AFTERMOVIE_RENDER_PROVIDER=mock is not allowed in production.",
      );
    }
    if (mode === "remotion") {
      throw new Error(
        "Remotion worker is not configured. Use AFTERMOVIE_RENDER_PROVIDER=manual.",
      );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in production.");
    }
    if (
      !(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
        process.env.SUPABASE_URL?.trim()
      )
    ) {
      throw new Error("SUPABASE URL is required in production.");
    }
  }

  if (mode === "mock" && isProductionRuntime()) {
    throw new Error("Mock aftermovie provider rejected in production.");
  }

  return mode;
}

export function getCronSecretOrThrowInProduction(): string | null {
  const secret = process.env.CRON_SECRET?.trim() || null;
  if (isProductionRuntime() && !secret) {
    console.error(
      "[aftermovie-cron] CRON_SECRET is required in production. Fail closed.",
    );
    return null;
  }
  return secret;
}

export function getAdminSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) {
    if (isProductionRuntime()) {
      throw new Error(
        "ADMIN_SESSION_SECRET (or CRON_SECRET / service role) is required.",
      );
    }
    return "memoora-dev-admin-session";
  }
  return secret;
}
