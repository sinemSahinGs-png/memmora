import { NextResponse, type NextRequest } from "next/server";
import {
  extractCoupleSlugFromHost,
  isLocalDevHost,
  normalizeHostname,
} from "@/lib/host-routing";

export function middleware(request: NextRequest) {
  const hostname = normalizeHostname(request.headers.get("host") ?? "");

  // Dev: localhost, 127.0.0.1, LAN IP — always use path-based /slug routes.
  if (isLocalDevHost(hostname)) {
    return NextResponse.next();
  }

  const slug = extractCoupleSlugFromHost(hostname);
  if (!slug) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Explicit path wins over subdomain (e.g. /berkin-beste on any host).
  if (
    pathname === `/${slug}` ||
    pathname.startsWith(`/${slug}/`)
  ) {
    return NextResponse.next();
  }

  // Subdomain root → couple world page.
  if (pathname === "/") {
    return NextResponse.rewrite(new URL(`/${slug}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
