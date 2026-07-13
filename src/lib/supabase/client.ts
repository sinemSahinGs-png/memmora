import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

const ENV_URL = "NEXT_PUBLIC_SUPABASE_URL";
const ENV_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getSupabaseEnvStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {
    hasUrl: Boolean(url),
    hasKey: Boolean(anonKey),
    configured: Boolean(url && anonKey),
    urlHost: url ? tryParseHost(url) : null,
  };
}

function tryParseHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      `Supabase env eksik. ${ENV_URL} ve ${ENV_KEY} proje kökündeki .env.local dosyasında tanımlı olmalı.`
    );
  }

  if (url.includes("your-project")) {
    console.warn(
      `[Memoora] ${ENV_URL} hâlâ placeholder görünüyor. Gerçek Supabase proje URL'sini .env.local içine yazın.`
    );
  }

  if (!client) {
    client = createClient<Database>(url, anonKey);
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnvStatus().configured;
}
