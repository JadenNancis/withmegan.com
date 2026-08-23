"use client";

import { signOut, useSession } from "next-auth/react";

/**
 * Sign-in/sign-up entry points are intentionally hidden from public visitors
 * on both portals. Staff and admins reach /auth/signin directly by URL.
 * The signed-in state (email + sign out) stays visible so staff can log out.
 *
 * Sign-out deliberately avoids Auth.js's redirect handling: it uses a
 * relative target ("/") so the user always lands back on the same domain.
 * This matters because the two production domains share one deployment and
 * must never be bounced across origins after signing out.
 */
export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) return null;

  async function handleSignOut() {
    await signOut({ redirect: false, callbackUrl: "/" });
    window.location.href = "/";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70 hidden sm:inline whitespace-nowrap">
        {session.user.email}
      </span>
      <button
        onClick={() => void handleSignOut()}
        className="text-sm px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap font-medium"
      >
        Sign Out
      </button>
    </div>
  );
}
