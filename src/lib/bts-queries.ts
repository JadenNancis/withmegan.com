import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  auditLog,
} from "@/db/schema";
import { eq, ilike, or, desc, inArray, isNull, isNotNull, and, count } from "drizzle-orm";
import { extractApplicationId } from "@/lib/application-id";

export interface GuardianWithDependents {
  id: string;
  fullName: string;
  nationalId: string | null;
  contactNumber: string;
  email: string;
  address: string;
  consent: boolean;
  thaId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  dependents: Array<{
    id: string;
    studentName: string;
    schoolName: string;
    gradeLevel: string;
    notes: string | null;
    bookListUrl: string | null;
    createdAt: Date;
    assignments: Array<{
      id: string;
      itemName: string;
      quantityAssigned: number;
      quantityCollected: number;
      status: "pending" | "partial" | "full" | "collected";
      collectedByName: string | null;
      collectedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
}

export async function getGuardianWithDependents(guardianId: string): Promise<GuardianWithDependents | null> {
  const guardian = await db
    .select()
    .from(btsGuardians)
    .where(eq(btsGuardians.id, guardianId))
    .limit(1);

  if (guardian.length === 0) return null;

  const dependents = await db
    .select()
    .from(btsDependents)
    .where(eq(btsDependents.guardianId, guardianId));

  const dependentIds = dependents.map((d) => d.id);
  const assignments =
    dependentIds.length > 0
      ? await db.select().from(btsResourceAssignments).where(inArray(btsResourceAssignments.dependentId, dependentIds))
      : [];

  const assignmentsByDependent = new Map<string, GuardianWithDependents["dependents"][number]["assignments"]>();
  for (const a of assignments) {
    const list = assignmentsByDependent.get(a.dependentId) ?? [];
    list.push({
      id: a.id,
      itemName: a.itemName,
      quantityAssigned: a.quantityAssigned,
      quantityCollected: a.quantityCollected,
      status: a.status,
      collectedByName: a.collectedByName,
      collectedAt: a.collectedAt,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    });
    assignmentsByDependent.set(a.dependentId, list);
  }

  return {
    ...guardian[0],
    dependents: dependents.map((d) => ({
      id: d.id,
      studentName: d.studentName,
      schoolName: d.schoolName,
      gradeLevel: d.gradeLevel,
      notes: d.notes,
      bookListUrl: d.bookListUrl,
      createdAt: d.createdAt,
      assignments: assignmentsByDependent.get(d.id) ?? [],
    })),
  };
}

/** Soft-deleted guardians, newest first, for the hidden deleted tab. */
export async function getDeletedGuardians(search?: string): Promise<GuardianWithDependents[]> {  const guardians = search
    ? await db
        .select()
        .from(btsGuardians)
        .where(
          and(
            isNotNull(btsGuardians.deletedAt),
            or(
              ilike(btsGuardians.fullName, `%${search}%`),
              ilike(btsGuardians.nationalId, `%${search}%`),
              ilike(btsGuardians.email, `%${search}%`),
              ilike(btsGuardians.thaId, `%${search}%`),
            ),
          ),
        )
        .orderBy(desc(btsGuardians.createdAt))
    : await db
        .select()
        .from(btsGuardians)
        .where(isNotNull(btsGuardians.deletedAt))
        .orderBy(desc(btsGuardians.createdAt));

  const guardianIds = guardians.map((g) => g.id);
  if (guardianIds.length === 0) return [];

  const dependents = await db
    .select()
    .from(btsDependents)
    .where(inArray(btsDependents.guardianId, guardianIds));

  const dependentsByGuardian = new Map<string, typeof dependents>();
  for (const d of dependents) {
    const list = dependentsByGuardian.get(d.guardianId) ?? [];
    list.push(d);
    dependentsByGuardian.set(d.guardianId, list);
  }

  return guardians.map((g) => ({
    id: g.id,
    fullName: g.fullName,
    nationalId: g.nationalId,
    contactNumber: g.contactNumber,
    email: g.email,
    address: g.address,
    consent: g.consent,
    thaId: g.thaId,
    deletedAt: g.deletedAt,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    dependents: (dependentsByGuardian.get(g.id) ?? []).map((d) => ({
      id: d.id,
      studentName: d.studentName,
      schoolName: d.schoolName,
      gradeLevel: d.gradeLevel,
      notes: d.notes,
      bookListUrl: d.bookListUrl,
      createdAt: d.createdAt,
      assignments: [],
    })),
  }));
}

export async function getGuardianByApplicationId(aid: string): Promise<GuardianWithDependents | null> {
  const [guardian] = await db
    .select()
    .from(btsGuardians)
    .where(and(eq(btsGuardians.thaId, aid), isNull(btsGuardians.deletedAt)))
    .limit(1);

  if (!guardian) return null;
  return getGuardianWithDependents(guardian.id);
}

export interface CollectionSearchResult {
  id: string;
  fullName: string;
  thaId: string | null;
  contactNumber: string;
  email: string;
  address: string;
  dependentCount: number;
}

/**
 * Collection-counter lookup: match ANY field the clerk types.
 *
 * An exact Application ID jumps straight to that family. Any other text is
 * matched across guardian fields (name, phone, email, address, National ID,
 * Application ID) and dependent fields (child name, school, grade), so a
 * counter clerk can find a family by a partial name, a phone number, an
 * address, or a child's school. Soft-deleted registrations are excluded.
 */
export async function searchGuardiansForCollection(
  query: string,
): Promise<CollectionSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const aid = extractApplicationId(q);
  if (aid) {
    const [guardian] = await db
      .select()
      .from(btsGuardians)
      .where(and(eq(btsGuardians.thaId, aid), isNull(btsGuardians.deletedAt)))
      .limit(1);
    if (!guardian) return [];

    const dependents = await db
      .select({ id: btsDependents.id })
      .from(btsDependents)
      .where(eq(btsDependents.guardianId, guardian.id));

    return [
      {
        id: guardian.id,
        fullName: guardian.fullName,
        thaId: guardian.thaId,
        contactNumber: guardian.contactNumber,
        email: guardian.email,
        address: guardian.address,
        dependentCount: dependents.length,
      },
    ];
  }

  const like = `%${q}%`;

  // Guardians whose own fields match…
  const guardianRows = await db
    .select()
    .from(btsGuardians)
    .where(
      and(
        isNull(btsGuardians.deletedAt),
        or(
          ilike(btsGuardians.fullName, like),
          ilike(btsGuardians.nationalId, like),
          ilike(btsGuardians.contactNumber, like),
          ilike(btsGuardians.email, like),
          ilike(btsGuardians.address, like),
          ilike(btsGuardians.thaId, like),
        ),
      ),
    )
    .orderBy(desc(btsGuardians.createdAt))
    .limit(50);

  // …plus guardians whose children/students match (child name, school, grade).
  const dependentRows = await db
    .selectDistinctOn([btsDependents.guardianId], {
      guardianId: btsDependents.guardianId,
    })
    .from(btsDependents)
    .where(
      or(
        ilike(btsDependents.studentName, like),
        ilike(btsDependents.schoolName, like),
        ilike(btsDependents.gradeLevel, like),
      ),
    )
    .orderBy(btsDependents.guardianId);

  const ids = new Set<string>([
    ...guardianRows.map((g) => g.id),
    ...dependentRows.map((d) => d.guardianId),
  ]);
  if (ids.size === 0) return [];

  const guardians = await db
    .select()
    .from(btsGuardians)
    .where(and(isNull(btsGuardians.deletedAt), inArray(btsGuardians.id, [...ids])))
    .orderBy(desc(btsGuardians.createdAt))
    .limit(50);

  const depRows = await db
    .select({ id: btsDependents.id, guardianId: btsDependents.guardianId })
    .from(btsDependents)
    .where(inArray(btsDependents.guardianId, guardians.map((g) => g.id)));

  const counts = new Map<string, number>();
  for (const d of depRows) {
    counts.set(d.guardianId, (counts.get(d.guardianId) ?? 0) + 1);
  }

  return guardians.map((g) => ({
    id: g.id,
    fullName: g.fullName,
    thaId: g.thaId,
    contactNumber: g.contactNumber,
    email: g.email,
    address: g.address,
    dependentCount: counts.get(g.id) ?? 0,
  }));
}

export async function getAllGuardians(search?: string): Promise<GuardianWithDependents[]> {
  const guardians = search
    ? await db
        .select()
        .from(btsGuardians)
        .where(
          and(
            isNull(btsGuardians.deletedAt),
            or(
              ilike(btsGuardians.fullName, `%${search}%`),
              ilike(btsGuardians.nationalId, `%${search}%`),
              ilike(btsGuardians.email, `%${search}%`),
              ilike(btsGuardians.thaId, `%${search}%`),
            ),
          ),
        )
        .orderBy(desc(btsGuardians.createdAt))
    : await db
        .select()
        .from(btsGuardians)
        .where(isNull(btsGuardians.deletedAt))
        .orderBy(desc(btsGuardians.createdAt));

  const guardianIds = guardians.map((g) => g.id);
  if (guardianIds.length === 0) return [];

  const dependents = guardianIds.length > 0
    ? await db.select().from(btsDependents).where(inArray(btsDependents.guardianId, guardianIds))
    : [];

  const dependentsByGuardian = new Map<string, typeof dependents>();
  for (const d of dependents) {
    const list = dependentsByGuardian.get(d.guardianId) ?? [];
    list.push(d);
    dependentsByGuardian.set(d.guardianId, list);
  }

  return guardians.map((g) => ({
    id: g.id,
    fullName: g.fullName,
    nationalId: g.nationalId,
    contactNumber: g.contactNumber,
    email: g.email,
    address: g.address,
    consent: g.consent,
    thaId: g.thaId,
    deletedAt: g.deletedAt,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    dependents: (dependentsByGuardian.get(g.id) ?? []).map((d) => ({
      id: d.id,
      studentName: d.studentName,
      schoolName: d.schoolName,
      gradeLevel: d.gradeLevel,
      notes: d.notes,
      bookListUrl: d.bookListUrl,
      createdAt: d.createdAt,
      assignments: [],
    })),
  }));
}

export async function countDeletedGuardians(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(btsGuardians)
    .where(isNotNull(btsGuardians.deletedAt));
  return row?.n ?? 0;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  actorEmail: string | null;
  action: string;
  target: string | null;
  details: unknown;
  createdAt: Date;
}

export async function getAuditTrailForGuardian(guardian: {
  thaId: string | null;
  id: string;
}): Promise<AuditEntry[]> {
  const targetPattern = guardian.thaId ? `registration:${guardian.thaId}` : null;
  const entries = await db
    .select()
    .from(auditLog)
    .where(
      targetPattern
        ? eq(auditLog.target, targetPattern)
        : eq(auditLog.actorId, guardian.id),
    )
    .orderBy(desc(auditLog.createdAt));

  return entries.map((e) => ({
    id: e.id,
    actorId: e.actorId,
    actorEmail: e.actorEmail,
    action: e.action,
    target: e.target,
    details: e.details,
    createdAt: e.createdAt,
  }));
}