import { NextResponse, type NextRequest } from "next/server";
import { resolveSite } from "@/sites/site-registry";

/**
 * Domain-based routing.
 *
 * Each production domain points at this single Vercel deployment. Middleware
 * inspects the Host header, resolves the active site, and rewrites the URL
 * path to the site's internal prefix (`/bts` or `/md`). This keeps the page
 * tree clean while letting each domain show its own branding and routes.
 *
 * In dev (localhost:3000) the root renders a small index that lets you pick
 * a site, and `?site=bts|md` overrides the host for testing.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const searchParams = req.nextUrl.searchParams;

  // Already-prefixed paths pass through unchanged.
  if (pathname.startsWith("/bts") || pathname.startsWith("/md")) {
    return NextResponse.next();
  }

  // Shared paths (auth, api, static assets) pass through unchanged.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const site = resolveSite(req.headers.get("host"), searchParams);

  // On localhost with no override, show the dev index page.
  const host = (req.headers.get("host") ?? "").split(":")[0];
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const hasOverride = searchParams.get("site") !== null;
  if (isLocalhost && !hasOverride && pathname === "/") {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `${site.routePrefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};