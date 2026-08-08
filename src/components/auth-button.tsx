"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="flex items-center gap-0.5">
        <Link
          href="/auth/signin"
          className="text-sm px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signin?tab=signup"
          className="text-sm px-2.5 py-1.5 rounded-md bg-white/15 hover:bg-white/25 transition-colors whitespace-nowrap font-medium"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70 hidden sm:inline whitespace-nowrap">
        {session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap font-medium"
      >
        Sign Out
      </button>
    </div>
  );
}