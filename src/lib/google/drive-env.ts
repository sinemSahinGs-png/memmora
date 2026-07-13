import { loadEnvConfig } from "@next/env";

/** Server-only Google Drive OAuth env validation. */

let envLoaded = false;

function ensureServerEnvLoaded(): void {
  if (envLoaded) return;
  loadEnvConfig(process.cwd());
  envLoaded = true;
}

function readEnv(name: string): string | undefined {
  ensureServerEnvLoaded();
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function logDriveEnvCheck(logPrefix = "[upload-to-drive]"): void {
  ensureServerEnvLoaded();
  console.log(`${logPrefix} env check`, {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL")),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY")),
    GOOGLE_CLIENT_ID: Boolean(readEnv("GOOGLE_CLIENT_ID")),
    GOOGLE_CLIENT_SECRET: Boolean(readEnv("GOOGLE_CLIENT_SECRET")),
    GOOGLE_REFRESH_TOKEN: Boolean(readEnv("GOOGLE_REFRESH_TOKEN")),
    GOOGLE_DRIVE_PARENT_FOLDER_ID: Boolean(
      readEnv("GOOGLE_DRIVE_PARENT_FOLDER_ID")
    ),
  });
}

export function getMissingDriveEnvVars(): string[] {
  const missing: string[] = [];

  if (!readEnv("NEXT_PUBLIC_SUPABASE_URL")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!readEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!readEnv("GOOGLE_CLIENT_ID")) {
    missing.push("GOOGLE_CLIENT_ID");
  }
  if (!readEnv("GOOGLE_CLIENT_SECRET")) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }
  if (!readEnv("GOOGLE_REFRESH_TOKEN")) {
    missing.push("GOOGLE_REFRESH_TOKEN");
  }
  if (!readEnv("GOOGLE_DRIVE_PARENT_FOLDER_ID")) {
    missing.push("GOOGLE_DRIVE_PARENT_FOLDER_ID");
  }

  return missing;
}

export function isGoogleDriveConfigured(): boolean {
  return getMissingDriveEnvVars().length === 0;
}

export function assertGoogleDriveConfigured(): void {
  const missing = getMissingDriveEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Google Drive OAuth yapılandırması eksik: ${missing.join(", ")}`
    );
  }
}
