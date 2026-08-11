"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode, type ReactElement } from "react";
import { useSession } from "next-auth/react";
import type { SiteConfig } from "@/sites/site-registry";
import { SiteProvider } from "@/sites/site-context";
import { AuthButton } from "@/components/auth-button";
import { cn } from "@/lib/cn";

/**
 * Returns true if the current session has an admin or staff role.
 * Used to gate visibility of the Admin nav link and admin overhead bar.
 */
function useIsStaff() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin" || role === "staff";
}

const accentMap = {
  cyan: {
    header: "bg-brand-800",
    headerText: "text-white",
    button: "bg-brand-600 hover:bg-brand-700 text-white",
    focusRing: "focus:ring-brand-500",
    badge: "bg-brand-100 text-brand-800",
    bottomNav: "bg-brand-900",
    bottomNavActive: "text-brand-300",
    bottomNavIcon: "text-white/60",
  },
  amber: {
    header: "bg-amber-700",
    headerText: "text-white",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    focusRing: "focus:ring-amber-500",
    badge: "bg-amber-100 text-amber-800",
    bottomNav: "bg-amber-900",
    bottomNavActive: "text-amber-300",
    bottomNavIcon: "text-white/60",
  },
} as const;

const BOTTOM_NAV_ICONS: Record<string, ReactElement> = {
  Home: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  ),
  Register: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  ID: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M15 9h4M15 13h4M7 16h10" />
    </svg>
  ),
  Progress: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-5" />
    </svg>
  ),
  Gallery: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  Supporters: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const HAMBURGER_ICON = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/**
 * Shared layout shell with mobile-first navigation:
 * - Header with logo + hamburger (all links in disclosure menu)
 * - Bottom navigation bar on mobile with the 4 most-used links
 * - Desktop horizontal nav at md+ breakpoint
 * Bottom nav gives thumb-first access; hamburger reveals everything.
 */
export function SiteShell({ site, children }: { site: SiteConfig; children: ReactNode }) {
  const a = accentMap[site.accent];
  const [menuOpen, setMenuOpen] = useState(false);
  const isStaff = useIsStaff();
  const pathname = usePathname();

  // Filter out admin links unless the user is admin/staff.
  // Also hide Progress, ID (recover), and Gallery from non-staff users
  // for the initial launch phase.
  const visibleNav = site.nav.filter((n) => {
    if (n.href.includes("/admin")) return isStaff;
    if (n.href.includes("/progress")) return isStaff;
    if (n.href.includes("/recover")) return isStaff;
    if (n.href.includes("/gallery")) return isStaff;
    return true;
  });
  const pageLinks = visibleNav.filter((n) => n.href !== "/auth/signin");
  const signIn = site.nav.find((n) => n.href === "/auth/signin");

  // Bottom nav: first 4 non-admin links, filtered to the most useful ones
  const bottomNavLinks = visibleNav
    .filter((n) => !n.href.includes("/admin") && n.href !== "/auth/signin")
    .slice(0, 4);

  function isActive(href: string) {
    if (href === site.nav[0].href) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <SiteProvider site={site}>
      <div className="min-h-screen flex flex-col tha-warm-bg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <header
          className={cn(a.header, a.headerText, "sticky top-0 z-40")}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto max-w-6xl px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
            <Link
              href={site.nav[0].href}
              className="flex flex-col shrink min-w-0 min-h-[40px] justify-center"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-xs sm:hidden font-bold leading-tight truncate">{site.shortName}</span>
              <span className="hidden sm:block text-lg font-bold leading-tight truncate">{site.name}</span>
              <span className="hidden sm:block text-xs opacity-80 truncate leading-tight">{site.tagline}</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-0.5 items-center overflow-x-auto no-scrollbar min-w-0 shrink-0" aria-label="Site">
              {visibleNav.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
              ))}
              <AuthButton />
            </nav>

            {/* Mobile menu button — 44px touch target */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all shrink-0"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                HAMBURGER_ICON
              )}
            </button>
          </div>

          {/* Mobile disclosure nav — slide-down panel (gated by reduced-motion) */}
          {menuOpen && (
            <nav
              id="mobile-nav"
              className="md:hidden border-t border-white/15 px-4 pb-4 pt-2 motion-safe:animate-[slide-down_0.2s_ease-out]"
              aria-label="Site"
            >
              <ul className="space-y-0.5">
                {pageLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3.5 text-base font-medium hover:bg-white/10 active:bg-white/15 transition-colors min-h-[48px] flex items-center",
                        isActive(item.href) && "bg-white/10 font-semibold",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-white/15">
                  {signIn ? (
                    <Link
                      href={signIn.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-4 py-3.5 text-base font-medium hover:bg-white/10 transition-colors min-h-[48px] flex items-center"
                    >
                      {signIn.label}
                    </Link>
                  ) : (
                    <div className="py-1">
                      <AuthButton />
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          )}
        </header>

        <main
          id="main"
          className="flex-1 mx-auto max-w-4xl w-full px-4 py-5 sm:py-8 pb-28 md:pb-8"
        >
          {children}
        </main>

        <footer className="border-t border-white/20 pb-24 md:pb-0">
          <div className="mx-auto max-w-4xl px-4 py-4 text-xs text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            <p>
              {site.name} · Event date:{" "}
              {new Date(site.eventDate + "T12:00:00").toLocaleDateString("en-TT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mt-1">Mt. St. George/Goodwood, Tobago · A THA-supported community programme</p>
          </div>
        </footer>

        {/* Bottom navigation bar — thumb-first mobile nav */}
        <nav
          className={cn(
            "md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10",
            a.bottomNav,
            "backdrop-blur-lg",
          )}
          aria-label="Quick navigation"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          }}
        >
          <ul className="flex items-stretch justify-around max-w-lg mx-auto">
            {bottomNavLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors",
                      active ? a.bottomNavActive : a.bottomNavIcon,
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {BOTTOM_NAV_ICONS[item.label] ?? HAMBURGER_ICON}
                    <span className="text-[10px] font-medium leading-none truncate max-w-full px-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </SiteProvider>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap min-h-[40px] flex items-center",
        active && "bg-white/10 font-semibold",
      )}
    >
      {label}
    </Link>
  );
}

export { accentMap };