import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Shared Auth.js v5 configuration.
 *
 * One auth realm, one set of users. A user's `role` ("admin" | "staff" | "viewer")
 * gates access to admin routes on BOTH sites. The role is selected at sign-in
 * (the single prototype account accepts any of the three roles) and carried in
 * the JWT so downstream `requireAdmin` checks can enforce minimum privilege.
 *
 * Prototype: JWT-based session with hardcoded admin credentials so auth
 * works without a database connection. Production should swap to database
 * sessions with DrizzleAdapter + an OAuth provider (Google, Azure AD), and
 * source roles from the users table instead of the sign-in form.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@withmegan.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

const VALID_ROLES = new Set(["admin", "staff", "viewer"]);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(creds) {
        const email = creds?.email as string | undefined;
        const password = creds?.password as string | undefined;
        const requestedRole = (creds?.role as string | undefined) ?? "admin";
        if (!email || !password) return null;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          // The single prototype account accepts any of the three roles; the
          // selected role determines what the session can reach after sign-in.
          const role = VALID_ROLES.has(requestedRole) ? requestedRole : "admin";
          return {
            id: "admin-prototype",
            email,
            name: "Administrator",
            role,
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