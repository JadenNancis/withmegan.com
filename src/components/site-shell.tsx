"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { SiteConfig } from "@/sites/site-registry";
import { SiteProvider } from "@/sites/site-context";
import { AuthButton } from "@/components/auth-button";
import { cn } from "@/lib/cn";

const accentMap = {
  cyan: {
    header: "bg-brand-800",
    headerText: "text-white",
    button: "bg-brand-600 hover:bg-brand-700 text-white",
    focusRing: "focus:ring-brand-500",
    badge: "bg-brand-100 text-brand-800",
  },
  amber: {
    header: "bg-amber-700",
    headerText: "text-white",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    focusRing: "focus:ring-amber-500",
    badge: "bg-amber-100 text-amber-800",
  },
} as const;

/**
 * Shared layout shell. Header collapses into a disclosure menu on
 * mobile — four+ nav links plus auth overflow a 390px viewport.
 */
export function SiteShell({ site, children }: { site: SiteConfig; children: ReactNode }) {
  const a = accentMap[site.accent];
  const [menuOpen, setMenuOpen] = useState(false);
  const pageLinks = site.nav.filter((n) => n.href !== "/auth/signin");
  const signIn = site.nav.find((n) => n.href === "/auth/signin");

  return (
    <SiteProvider site={site}>
      <div className="min-h-screen flex flex-col tha-warm-bg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <header className={cn(a.header, a.headerText)}>
          <div className="mx-auto max-w-6xl px-4 py-3.5 flex items-center justify-between gap-4">
            <Link href={site.nav[0].href} className="flex flex-col shrink-0 max-w-[38%] md:max-w-[32%]" onClick={() => setMenuOpen(false)}>
              <span className="text-lg font-bold leading-tight truncate">{site.name}</span>
              <span className="text-xs opacity-80 truncate">{site.tagline}</span>
            </Link>

            {/* Desktop nav — scrolls horizontally instead of wrapping */}
            <nav className="hidden md:flex gap-0.5 items-center overflow-x-auto no-scrollbar min-w-0" aria-label="Site">
              {site.nav.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
              <AuthButton />
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile disclosure nav */}
          {menuOpen && (
            <nav id="mobile-nav" className="md:hidden border-t border-white/15 px-4 pb-4 pt-2" aria-label="Site">
              <ul className="space-y-1">
                {pageLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-white/10 transition-colors min-h-[44px]"
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
                      className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-white/10 transition-colors min-h-[44px]"
                    >
                      {signIn.label}
                    </Link>
                  ) : (
                    <AuthButton />
                  )}
                </li>
              </ul>
            </nav>
          )}
        </header>
        <main id="main" className="flex-1 mx-auto max-w-4xl w-full px-4 py-6 sm:py-8">{children}</main>
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-4xl px-4 py-4 text-xs text-white/50">
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
      </div>
    </SiteProvider>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap">
      {label}
    </Link>
  );
}

export { accentMap };
