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
    <nav className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-t-md",
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