"use client";

import { signOut, useSession } from "next-auth/react";

/**
 * Sign-in/sign-up entry points are intentionally hidden from public visitors
 * on both portals. Staff and admins reach /auth/signin directly by URL.
 * The signed-in state (email + sign out) stays visible so staff can log out.
 */
export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) return null;

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
