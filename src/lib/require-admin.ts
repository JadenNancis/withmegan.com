import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { roleAtLeast, asRole, type Role } from "@/lib/rbac";

/**
 * Gate for admin routes. Call at the top of any server component / route
 * handler that should only be accessible to authenticated users.
 *
 * Pass `callbackPath` so the user returns to the page they tried to access.
 *
 * `requiredRole` controls the minimum privilege needed:
 *   - "admin":  only admins pass.
 *   - "staff":  admin and staff pass.
 *   - "viewer": all three roles pass.
 *   - undefined: defaults to "staff" (backward compatible with existing pages).
 *
 * Returns the authenticated user (with role) or redirects to sign-in.
 */
export async function requireAdmin(
  callbackPath?: string,
  requiredRole?: Role,
): Promise<{ id: string; email: string | null; name: string | null; role: string }> {
  const session = await auth();
  if (!session?.user) {
    const cb = callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : "";
    redirect(`/auth/signin${cb}`);
  }

  const min: Role = requiredRole ?? "staff";
  const actual = asRole((session.user as { role?: string }).role);

  if (!roleAtLeast(actual, min)) {
    redirect("/auth/signin");
  }

  return session.user as { id: string; email: string | null; name: string | null; role: string };
}