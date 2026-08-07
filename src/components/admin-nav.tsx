import Link from "next/link";
import { cn } from "@/lib/cn";

type AdminSite = "bts" | "md";

const LINKS: Record<AdminSite, { href: string; label: string }[]> = {
  bts: [
    { href: "/bts/admin", label: "Registrations" },
    { href: "/bts/admin/dashboard", label: "Dashboard" },
    { href: "/bts/admin/walkin", label: "Walk-in" },
    { href: "/bts/admin/scan", label: "Scan" },
    { href: "/bts/admin/inventory", label: "Inventory" },
    { href: "/bts/admin/gallery", label: "Gallery" },
    { href: "/bts/admin/reports", label: "Reports" },
  ],
  md: [
    { href: "/md/admin", label: "Dashboard" },
    { href: "/md/admin/dashboard", label: "Event Day" },
    { href: "/md/admin/walkin", label: "Walk-in" },
    { href: "/md/admin/scan", label: "Scan" },
    { href: "/md/admin/households", label: "Households" },
    { href: "/md/admin/verify", label: "Verify" },
    { href: "/md/admin/gallery", label: "Gallery" },
    { href: "/md/admin/reports", label: "Reports" },
  ],
};

const ACTIVE_STYLES: Record<AdminSite, string> = {
  bts: "bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500",
  md: "bg-amber-50 text-amber-700 border-b-2 border-amber-500",
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
    <nav
      aria-label="Admin sections"
      className="flex gap-1 border-b border-gray-200 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar"
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "whitespace-nowrap px-4 py-3 text-sm font-medium rounded-t-md min-h-[44px] flex items-center transition-colors",
            current === l.href
              ? ACTIVE_STYLES[site]
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}