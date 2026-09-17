import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge proxy (Next.js 16 name for middleware).
 * - Redirects unauthenticated users to /login when AUTH_ENFORCED=true.
 * - Adds baseline security headers on every response.
 * - Attaches a request id for tracing / audit logs.
 */
const PUBLIC = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/api/v1/auth", "/api/v1/webhooks"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const enforced = process.env.AUTH_ENFORCED === "true";
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  const session = request.cookies.get("lp_session")?.value;

  if (enforced && !isPublic && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", crypto.randomUUID());
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(self)");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|recordings).*)"],
};
