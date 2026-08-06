import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

/**
 * Shared Auth.js v5 configuration.
 *
 * One auth realm, one set of users. A user's `role` column ("admin" | "staff")
 * gates access to admin routes on BOTH sites. This keeps admin onboarding
 * simple: one account, two dashboards.
 *
 * Prototype uses Credentials with a single seeded admin. Production should
 * swap in an OAuth provider (Google, Azure AD, etc.) per the security notes.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@withmegan.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email as string | undefined;
        const password = creds?.password as string | undefined;
        if (!email || !password) return null;

        // Prototype: single hardcoded admin. Swap for real user lookup.
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          // Upsert so the session has a real user row.
          const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (existing[0]) {
            return { id: existing[0].id, email: existing[0].email, name: existing[0].name, role: existing[0].role } as any;
          }
          const [created] = await db
            .insert(users)
            .values({ email, name: "Administrator", role: "admin" })
            .returning();
          return { id: created.id, email: created.email, name: created.name, role: created.role } as any;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});