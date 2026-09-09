import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret";
}

/**
 * Protects the admin area. The login page and the auth API stay public;
 * everything else under /admin requires a valid session cookie.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page itself through.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token, sessionSecret());

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
