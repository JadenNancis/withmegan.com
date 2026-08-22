import Link from "next/link";
import { cn } from "@/lib/cn";

type AdminSite = "bts" | "md";

const LINKS: Record<AdminSite, { href: string; label: string }[]> = {
  bts: [
    { href: "/bts/admin", label: "Registrations" },
    { href: "/bts/admin/dashboard", label: "Dashboard" },
    { href: "/bts/admin/walkin", label: "Walk-in" },
    { href: "/bts/admin/scan", label: "Scan" },
    { href: "/bts/admin/collection", label: "Collection" },
    { href: "/bts/admin/inventory", label: "Inventory" },
    { href: "/bts/admin/volunteers", label: "Volunteers" },
    { href: "/bts/admin/gallery", label: "Gallery" },
    { href: "/bts/admin/reports", label: "Reports" },
    { href: "/bts/admin/users", label: "Users" },
    { href: "/bts/recover", label: "Find My ID" },
  ],
  md: [
    { href: "/md/admin", label: "Dashboard" },
    { href: "/md/admin/dashboard", label: "Event Day" },
    { href: "/md/admin/walkin", label: "Walk-in" },
    { href: "/md/admin/scan", label: "Scan" },
    { href: "/md/admin/verify", label: "Check-in" },
    { href: "/md/admin/volunteers", label: "Volunteers" },
    { href: "/md/admin/gallery", label: "Gallery" },
    { href: "/md/admin/reports", label: "Reports" },
    { href: "/md/admin/users", label: "Users" },
  ],
};

const TAB_BAR: Record<AdminSite, string> = {
  bts: "bg-brand-800",
  md: "bg-amber-700",
};

const ACTIVE_STYLES: Record<AdminSite, string> = {
  bts: "bg-white text-brand-800 shadow-sm",
  md: "bg-white text-amber-800 shadow-sm",
};

const IDLE_STYLES: Record<AdminSite, string> = {
  bts: "text-white/90 hover:text-white hover:bg-white/10",
  md: "text-white/90 hover:text-white hover:bg-white/10",
};

export function AdminNav({
  current,
  site = "md",
}: {
  current: string;
  site?: AdminSite;
}) {
  const links = LINKS[site];
  return (
    <div className={cn("-mx-4 -mt-5 sm:-mt-8 mb-4 sm:mb-6", TAB_BAR[site])}>
      <div className="mx-auto max-w-4xl px-4">
        <nav
          aria-label="Admin sections"
          className="flex gap-1 overflow-x-auto no-scrollbar pt-3 pb-0"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-t-lg px-3.5 sm:px-4 py-2.5 text-sm font-medium min-h-[44px] flex items-center transition-all active:scale-95",
                current === l.href
                  ? ACTIVE_STYLES[site]
                  : IDLE_STYLES[site],
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}