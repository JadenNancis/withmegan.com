/**
 * Central registry of the two public-facing sites served from this one codebase.
 *
 * Domain routing works by matching the incoming Host header against `host`
 * in middleware, then prefixing the internal route path with the site key.
 * Localhost dev: use `?site=bts` or `?site=md` query param, or set the
 * NEXT_PUBLIC_*_HOST env vars to localhost:3000.
 */

export type SiteKey = "bts" | "md";

export interface SiteConfig {
  key: SiteKey;
  /** Canonical production host, without protocol or port. */
  host: string;
  /** Display name shown in the header / title. */
  name: string;
  /** Compact name for mobile headers where space is tight. */
  shortName: string;
  /** Short tagline for the hero. */
  tagline: string;
  /** ISO date of the programme event. */
  eventDate: string;
  /** Primary brand colour. */
  accent: "cyan" | "amber";
  /** Full-page background image (site-specific). */
  background: string;
  /** Root path prefix the site is mounted under internally. */
  routePrefix: string;
  /** Community registration goal shown on the progress page and landing teaser. */
  goalFamilies: number;
  /** Nav items shown in the header. */
  nav: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
}

export const SITES: Record<SiteKey, SiteConfig> = {
  bts: {
    key: "bts",
    host: "backtoschoolwithmegan.tha.tt",
    name: "Back to School with Megan",
    shortName: "Back to School with Megan",
    tagline: "Book Drive · Mt. St. George/Goodwood, Tobago",
    eventDate: "2026-08-30",
    accent: "cyan",
    background: "/images/tobago/market-bg.jpg",
    routePrefix: "/bts",
    goalFamilies: 200,
    nav: [
      { label: "Home", href: "/bts" },
      { label: "Register", href: "/bts/register" },
      { label: "Volunteer", href: "/bts/volunteer" },
      { label: "ID", href: "/bts/recover" },
      { label: "Progress", href: "/bts/progress" },
      { label: "Gallery", href: "/bts/gallery" },
      { label: "Admin", href: "/bts/admin" },
    ],
  },
  md: {
    key: "md",
    host: "marketdaywithmegan.tha.tt",
    name: "Market Day with Megan",
    shortName: "Market Day with Megan",
    tagline: "Hamper Distribution · Mt. St. George/Goodwood, Tobago",
    eventDate: "2026-09-06",
    accent: "amber",
    background: "/images/tobago/classroom-bg.jpg",
    routePrefix: "/md",
    goalFamilies: 150,
    nav: [
      { label: "Home", href: "/md" },
      { label: "Register", href: "/md/register" },
      { label: "Volunteer", href: "/md/volunteer" },
      { label: "Progress", href: "/md/progress" },
      { label: "Gallery", href: "/md/gallery" },
      { label: "Supporters", href: "/md/supporters" },
      { label: "Admin", href: "/md/admin" },
    ],
  },
};

/**
 * Resolve which site the incoming request belongs to.
 * Falls back to `bts` so dev never 404s the root.
 */
export function resolveSite(hostHeader: string | null, searchParams?: URLSearchParams): SiteConfig {
  // 1. Explicit query override (dev convenience).
  if (searchParams) {
    const q = searchParams.get("site");
    if (q === "bts") return SITES.bts;
    if (q === "md") return SITES.md;
  }

  const host = (hostHeader ?? "").split(":")[0].toLowerCase();

  // 2. Env-configured localhost hosts (so both sites can be tested in dev).
  const btsHost = process.env.NEXT_PUBLIC_BTS_HOST;
  const mdHost = process.env.NEXT_PUBLIC_MD_HOST;
  if (btsHost && host === btsHost.split(":")[0]) return SITES.bts;
  if (mdHost && host === mdHost.split(":")[0]) return SITES.md;

  // 3. Production hosts.
  if (host === SITES.bts.host) return SITES.bts;
  if (host === SITES.md.host) return SITES.md;

  // 4. Fallback.
  return SITES.bts;
}

export function getSiteByKey(key: SiteKey): SiteConfig {
  return SITES[key];
}