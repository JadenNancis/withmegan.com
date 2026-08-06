import Link from "next/link";
import { cn } from "@/lib/cn";

const links = [
  { href: "/md/admin", label: "Dashboard" },
  { href: "/md/admin/households", label: "Households" },
  { href: "/md/admin/verify", label: "Verify" },
  { href: "/md/admin/reports", label: "Reports" },
];

export function AdminNav({ current }: { current: string }) {
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
              ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}