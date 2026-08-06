import { db } from "@/db/client";
import { auditLog } from "@/db/schema";
import type { SiteKey } from "@/sites/site-registry";

/**
 * Fire-and-forget audit logger. Never blocks the mutation on audit failure.
 *
 * Records who, what, when, which site, and the target entity reference.
 */

export async function logAudit(params: {
  actorId: string;
  actorEmail?: string;
  action: string;
  site: SiteKey;
  target?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: params.action,
      site: params.site,
      target: params.target,
      details: params.details,
    });
  } catch (err) {
    // Never block the mutation. Log to console for visibility in dev.
    console.error("[audit] failed to write audit row:", err);
  }
}