import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteConfig } from "@/sites/site-registry";
import { SiteProvider } from "@/sites/site-context";
import { cn } from "@/lib/cn";

const accentMap = {
  blue: {
    header: "bg-blue-700",
    headerText: "text-white",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    focusRing: "focus:ring-blue-500",
    badge: "bg-blue-100 text-blue-800",
  },
  amber: {
    header: "bg-amber-600",
    headerText: "text-white",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    focusRing: "focus:ring-amber-500",
    badge: "bg-amber-100 text-amber-800",
  },
} as const;

/**
 * Shared layout shell. Takes the resolved SiteConfig and renders a
 * site-branded header + footer with the site's nav items. Every page
 * in /bts and /md wraps its content in this.
 */
export function SiteShell({ site, children }: { site: SiteConfig; children: ReactNode }) {
  const a = accentMap[site.accent];
  return (
    <SiteProvider site={site}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className={cn(a.header, a.headerText)}>
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <Link href={site.nav[0].href} className="flex flex-col">
              <span className="text-lg font-bold leading-tight">{site.name}</span>
              <span className="text-xs opacity-80">{site.tagline}</span>
            </Link>
            <nav className="flex gap-1 sm:gap-4">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4 text-xs text-gray-500">
            <p>
              {site.name} · Event date:{" "}
              {new Date(site.eventDate).toLocaleDateString("en-TT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mt-1">Mount St. George &amp; Goodwood, Tobago · A THA-supported community initiative</p>
          </div>
        </footer>
      </div>
    </SiteProvider>
  );
}

export function useAccentClasses() {
  // Re-export for client components that need accent classes.
  return accentMap;
}

export { accentMap };