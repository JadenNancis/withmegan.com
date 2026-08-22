"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Table row that navigates when clicked — used for application lists so the
 * whole row opens the detail page, not just a small link. Keyboard
 * accessible (Enter / Space) with a visible focus ring.
 */
export function ClickableTableRow({
  href,
  children,
  className,
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const go = () => router.push(href);

  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  return (
    <tr
      onClick={go}
      onKeyDown={onKeyDown}
      role="link"
      tabIndex={0}
      aria-label={label ?? "View application details"}
      className={cn(
        "cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset",
        className,
      )}
    >
      {children}
    </tr>
  );
}
