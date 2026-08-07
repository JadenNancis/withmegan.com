"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70 hidden sm:inline whitespace-nowrap">
        {session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        Sign Out
      </button>
    </div>
  );
}
