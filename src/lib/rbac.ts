/**
 * Role-based access control (RBAC) for the With Megan platform.
 *
 * Two roles: admin and staff.
 *   - admin:  full access. Reports, exports, gallery upload, households,
 *             user management, all admin pages.
 *   - staff:  event-day access. Scan/verify, walk-in registration, verify counter.
 *             No reports, no exports, no gallery management, no user management.
 */

export type Role = "admin" | "staff";

/** Numeric rank for hierarchy comparisons. Higher = more privileged. */
const ROLE_RANK: Record<Role, number> = {
  admin: 20,
  staff: 10,
};

/** Roles that satisfy a given minimum requirement, ordered high to low. */
const ROLES_BY_MIN: Record<Role, Role[]> = {
  admin: ["admin"],
  staff: ["admin", "staff"],
};

/**
 * Returns true if `actual` meets or exceeds the `required` role.
 * Unknown / missing roles never pass.
 */
export function roleAtLeast(actual: string | undefined | null, required: Role): boolean {
  if (!actual) return false;
  const a = ROLE_RANK[actual as Role];
  const r = ROLE_RANK[required];
  if (a === undefined || r === undefined) return false;
  return a >= r;
}

/** Roles that satisfy a minimum requirement, highest privilege first. */
export function rolesForMin(required: Role): Role[] {
  return ROLES_BY_MIN[required];
}

/** Coerce an arbitrary string into a known Role, defaulting to "staff". */
export function asRole(value: string | undefined | null): Role {
  if (value === "admin" || value === "staff") return value;
  return "staff";
}