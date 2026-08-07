/**
 * Role-based access control (RBAC) for the With Megan platform.
 *
 * One auth realm, three roles. `roleAtLeast` is the canonical permission
 * helper — never inline role-name string checks in route handlers; call this.
 *
 * Role hierarchy (high → low): admin > staff > viewer
 *   - admin:  full access — reports, exports, gallery upload, households, all admin pages
 *   - staff:  event-day access — scan/verify, walk-in registration, verify counter.
 *             No reports, no exports, no gallery management.
 *   - viewer: read-only — can view reports and dashboards but not modify anything.
 *
 * "staff" is the default minimum role for legacy admin routes (backward compatible).
 */

export type Role = "admin" | "staff" | "viewer";

/** Numeric rank for hierarchy comparisons. Higher = more privileged. */
const ROLE_RANK: Record<Role, number> = {
  admin: 30,
  staff: 20,
  viewer: 10,
};

/** Roles that satisfy a given minimum requirement, ordered high → low. */
const ROLES_BY_MIN: Record<Role, Role[]> = {
  admin: ["admin"],
  staff: ["admin", "staff"],
  viewer: ["admin", "staff", "viewer"],
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

/** Coerce an arbitrary string into a known Role, defaulting to "viewer". */
export function asRole(value: string | undefined | null): Role {
  if (value === "admin" || value === "staff" || value === "viewer") return value;
  return "viewer";
}