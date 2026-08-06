import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Gate for admin routes. Call at the top of any server component / route
 * handler that should only be accessible to authenticated admins.
 *
 * Returns the authenticated user (with role) or redirects to sign-in.
 */

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const role = (session.user as any).role as string | undefined;
  if (role !== "admin" && role !== "staff") {
    redirect("/auth/signin");
  }
  return session.user as { id: string; email: string | null; name: string | null; role: string };
}