import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

/**
 * Shared Auth.js v5 configuration.
 *
 * Two ways to authenticate:
 * 1. Bootstrap admin — env-var email + password (no DB row needed).
 *    Used only by the platform owner until DB users exist.
 * 2. DB-backed users — email + password hashed with scrypt.
 *    New sign-ups are "pending" until an admin approves them.
 *    Approved users get role "staff" by default; admin can promote.
 *
 * Roles: "admin" | "staff" (no viewer).
 * JWT-based session carries the role for downstream requireAdmin checks.
 *
 * Future: swap to email magic-link SSO (passwordless). The signup form
 * already collects only email + password; the password field can become
 * optional once email verification is wired up.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@withmegan.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // Multi-domain deployment: the same auth realm serves btswithmegan.com and
  // mdwithmegan.com. trustHost lets Auth.js derive every redirect origin from
  // the actual request host (instead of a pinned AUTH_URL), so signing in and
  // out always stays on the domain the user is using.
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email as string | undefined)?.trim().toLowerCase();
        const password = creds?.password as string | undefined;
        if (!email || !password) return null;

        // 1. Bootstrap admin (env-var fallback).
        if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
          return {
            id: "admin-bootstrap",
            email,
            name: "Administrator",
            role: "admin",
          } as any;
        }

        // 2. DB-backed user.
        try {
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = rows[0];
          if (!user || !user.passwordHash) return null;

          // Approval gate.
          if (user.status !== "approved") return null;

          if (!verifyPassword(password, user.passwordHash)) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
            role: user.role ?? "staff",
          } as any;
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "staff";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});