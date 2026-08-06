import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Shared Auth.js v5 configuration.
 *
 * One auth realm, one set of users. A user's `role` ("admin" | "staff")
 * gates access to admin routes on BOTH sites.
 *
 * Prototype: JWT-based session with hardcoded admin credentials so auth
 * works without a database connection. Production should swap to database
 * sessions with DrizzleAdapter + an OAuth provider (Google, Azure AD).
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@withmegan.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
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

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return {
            id: "admin-prototype",
            email,
            name: "Administrator",
            role: "admin",
          } as any;
        }
        return null;
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