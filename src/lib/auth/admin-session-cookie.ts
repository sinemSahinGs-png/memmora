import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSessionSecret } from "@/lib/aftermovie/env";

export const COUPLE_ADMIN_COOKIE = "memoora_couple_admin";
export const SUPER_ADMIN_COOKIE = "memoora_super_admin";

const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

type CoupleSessionPayload = {
  role: "couple_admin";
  slug: string;
  coupleId: string;
  exp: number;
  nonce: string;
};

type SuperSessionPayload = {
  role: "super_admin";
  exp: number;
  nonce: string;
};

type SessionPayload = CoupleSessionPayload | SuperSessionPayload;

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", getAdminSessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getAdminSessionSecret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function safeEqualString(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still do a compare to reduce trivial timing oracles on length
    const padded = Buffer.alloc(ab.length);
    bb.copy(padded);
    timingSafeEqual(ab, padded);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

function cookieOptions(maxAge = MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function createCoupleAdminToken(input: {
  slug: string;
  coupleId: string;
}): string {
  return encode({
    role: "couple_admin",
    slug: input.slug.trim().toLowerCase(),
    coupleId: input.coupleId,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
    nonce: randomBytes(8).toString("hex"),
  });
}

export function createSuperAdminToken(): string {
  return encode({
    role: "super_admin",
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
    nonce: randomBytes(8).toString("hex"),
  });
}

export function attachCoupleAdminCookie(
  res: NextResponse,
  token: string,
): NextResponse {
  res.cookies.set(COUPLE_ADMIN_COOKIE, token, cookieOptions());
  return res;
}

export function attachSuperAdminCookie(
  res: NextResponse,
  token: string,
): NextResponse {
  res.cookies.set(SUPER_ADMIN_COOKIE, token, cookieOptions());
  return res;
}

export function clearAuthCookie(
  res: NextResponse,
  name: string,
): NextResponse {
  res.cookies.set(name, "", { ...cookieOptions(0), maxAge: 0 });
  return res;
}

export async function readCoupleAdminSession(): Promise<CoupleSessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(COUPLE_ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const payload = decode(raw);
  if (!payload || payload.role !== "couple_admin") return null;
  return payload;
}

export async function readSuperAdminSession(): Promise<SuperSessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SUPER_ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const payload = decode(raw);
  if (!payload || payload.role !== "super_admin") return null;
  return payload;
}

export async function requireCoupleAdminForSlug(slug: string): Promise<
  | { ok: true; session: CoupleSessionPayload }
  | { ok: false; status: number; error: string }
> {
  const session = await readCoupleAdminSession();
  if (!session) {
    return { ok: false, status: 401, error: "Oturum gerekli." };
  }
  if (session.slug !== slug.trim().toLowerCase()) {
    return { ok: false, status: 403, error: "Bu çift için yetkiniz yok." };
  }
  return { ok: true, session };
}

export async function requireSuperAdmin(): Promise<
  | { ok: true; session: SuperSessionPayload }
  | { ok: false; status: number; error: string }
> {
  const session = await readSuperAdminSession();
  if (!session) {
    return { ok: false, status: 401, error: "Süper admin oturumu gerekli." };
  }
  return { ok: true, session };
}

export function timingSafeBearerMatch(
  authorizationHeader: string | null,
  secret: string,
): boolean {
  if (!authorizationHeader?.startsWith("Bearer ")) return false;
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return safeEqualString(token, secret);
}
