import { STORAGE_BUCKET } from "./constants";
import { COUPLE_NOT_FOUND_MESSAGE } from "./couples";

export type SubmitStep =
  | "env"
  | "client"
  | "couple_lookup"
  | "contributions_insert"
  | "storage_upload"
  | "drive_upload"
  | "contribution_media_insert";

interface ErrorLike {
  message?: string;
  code?: string;
  statusCode?: string | number;
  error?: string;
}

function getMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as ErrorLike).message);
  }
  return String(error);
}

function getCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as ErrorLike).code);
  }
  return undefined;
}

function isRlsError(message: string, code?: string): boolean {
  return (
    code === "42501" ||
    /row-level security/i.test(message) ||
    /permission denied/i.test(message)
  );
}

function isCoupleFkError(message: string, code?: string): boolean {
  return (
    code === "23503" &&
    (/couple_id/i.test(message) || /couples/i.test(message))
  );
}

function isBucketMissing(message: string): boolean {
  return /bucket not found/i.test(message) || /Bucket not found/i.test(message);
}

function policyHint(step: SubmitStep): string | null {
  switch (step) {
    case "contributions_insert":
      return `Tablo: contributions — policy: "contributions_public_insert" (supabase/schema.sql)`;
    case "contribution_media_insert":
      return `Tablo: contribution_media — policy: "contribution_media_public_insert" (supabase/schema.sql)`;
    case "storage_upload":
      return `Bucket: "${STORAGE_BUCKET}" — Storage policy: "memories_public_upload" (supabase/schema.sql içinde yorum satırından açın)`;
    default:
      return null;
  }
}

export function logSubmitError(step: SubmitStep, error: unknown): void {
  console.error(`[Memoora submit] ${step}`, error);
}

export function formatSubmitError(step: SubmitStep, error: unknown): string {
  const message = getMessage(error);
  const code = getCode(error);

  logSubmitError(step, error);

  if (step === "env" || step === "client") {
    if (/env eksik/i.test(message)) {
      return "Supabase env eksik: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY proje kökündeki .env.local dosyasında tanımlı olmalı.";
    }
    return `Supabase bağlantı hatası: ${message}`;
  }

  if (step === "couple_lookup") {
    return COUPLE_NOT_FOUND_MESSAGE;
  }

  if (step === "contributions_insert") {
    if (isCoupleFkError(message, code)) {
      return `Couple bulunamadı: Bu çift Supabase'de yok. couple_id=${message}`;
    }
    if (isRlsError(message, code)) {
      const hint = policyHint(step);
      return `Mesaj kaydedilemedi: RLS engeli. ${hint ?? message}`;
    }
    return `Mesaj kaydedilemedi: ${message}`;
  }

  if (step === "storage_upload") {
    if (isBucketMissing(message)) {
      return `Dosya yükleme hatası: Storage bucket "${STORAGE_BUCKET}" bulunamadı. Supabase Dashboard → Storage → bucket oluşturun.`;
    }
    if (isRlsError(message, code)) {
      const hint = policyHint(step);
      return `Dosya yükleme hatası: Storage RLS/policy engeli. ${hint ?? message}`;
    }
    return `Dosya yükleme hatası: ${message}`;
  }

  if (step === "drive_upload") {
    return `Medya Drive'a yüklenemedi: ${message}`;
  }

  if (step === "contribution_media_insert") {
    if (isRlsError(message, code)) {
      const hint = policyHint(step);
      return `Medya kaydı oluşturulamadı: RLS engeli. ${hint ?? message}`;
    }
    return `Medya kaydı oluşturulamadı: ${message}`;
  }

  return message;
}
