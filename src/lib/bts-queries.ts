import { db } from "@/db/client";
import {
  btsGuardians,
  btsDependents,
  btsResourceAssignments,
  auditLog,
} from "@/db/schema";
import { eq, ilike, or, desc, inArray, isNull, isNotNull, and, count } from "drizzle-orm";

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