import { db } from "@/db/client";
import { mdRegistrants, mdHouseholds, auditLog } from "@/db/schema";
import { eq, sql, ilike, or, desc, count, and } from "drizzle-orm";

export interface DashboardStats {
  totalRegistrations: number;
  totalHouseholds: number;
  householdsAssigned: number;
  householdsRedeemed: number;
  householdsPending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [regCount] = await db.select({ n: count() }).from(mdRegistrants);
  const [hhCount] = await db.select({ n: count() }).from(mdHouseholds);
  const [assigned] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "assigned"));
  const [redeemed] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "redeemed"));
  const [unassigned] = await db
    .select({ n: count() })
    .from(mdHouseholds)
    .where(eq(mdHouseholds.hamperStatus, "unassigned"));

  const total = hhCount?.n ?? 0;
  const redeemedN = redeemed?.n ?? 0;
  const assignedN = assigned?.n ?? 0;

  return {
    totalRegistrations: regCount?.n ?? 0,
    totalHouseholds: total,
    householdsAssigned: assignedN,
    householdsRedeemed: redeemedN,
    householdsPending: total - redeemedN,
  };
}

export interface RecentRegistrant {
  id: string;
  thaId: string | null;
  fullName: string;
  householdReference: string | null;
  hamperStatus: "unassigned" | "assigned" | "redeemed" | null;
  createdAt: Date;
}

export async function getRecentRegistrations(limit = 20): Promise<RecentRegistrant[]> {
  const rows = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      createdAt: mdRegistrants.createdAt,
      householdReference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
    })
    .from(mdRegistrants)
    .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
    .orderBy(desc(mdRegistrants.createdAt))
    .limit(limit);
  return rows;
}

export interface SearchRegistrantResult {
  id: string;
  thaId: string | null;
  fullName: string;
  nationalId: string | null;
  dateOfBirth: string | null;
  address: string;
  phoneNumber: string;
  email: string | null;
  productCategory: string | null;
  productCategoryNote: string | null;
  createdAt: Date;
  householdId: string | null;
  householdReference: string | null;
  hamperStatus: "unassigned" | "assigned" | "redeemed" | null;
  redeemedAt: Date | null;
  redeemedBy: string | null;
}

export async function searchRegistrants(query: string, limit = 50): Promise<SearchRegistrantResult[]> {
  const pattern = `%${query.trim()}%`;
  return db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      nationalId: mdRegistrants.nationalId,
      dateOfBirth: mdRegistrants.dateOfBirth,
      address: mdRegistrants.address,
      phoneNumber: mdRegistrants.phoneNumber,
      email: mdRegistrants.email,
      productCategory: mdRegistrants.productCategory,
      productCategoryNote: mdRegistrants.productCategoryNote,
      createdAt: mdRegistrants.createdAt,
      householdId: mdRegistrants.householdId,
      householdReference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
      redeemedAt: mdHouseholds.redeemedAt,
      redeemedBy: mdHouseholds.redeemedBy,
    })
    .from(mdRegistrants)
    .leftJoin(mdHouseholds, eq(mdRegistrants.householdId, mdHouseholds.id))
    .where(
      or(
        ilike(mdRegistrants.fullName, pattern),
        ilike(mdRegistrants.thaId, pattern),
        ilike(mdRegistrants.nationalId, pattern),
        ilike(mdHouseholds.reference, pattern),
        ilike(mdRegistrants.phoneNumber, pattern),
      ),
    )
    .orderBy(desc(mdRegistrants.createdAt))
    .limit(limit);
}

export interface HouseholdWithCount {
  id: string;
  reference: string;
  hamperStatus: "unassigned" | "assigned" | "redeemed";
  redeemedAt: Date | null;
  redeemedBy: string | null;
  createdAt: Date;
  memberCount: number;
}

export async function getHouseholds(): Promise<HouseholdWithCount[]> {
  return db
    .select({
      id: mdHouseholds.id,
      reference: mdHouseholds.reference,
      hamperStatus: mdHouseholds.hamperStatus,
      redeemedAt: mdHouseholds.redeemedAt,
      redeemedBy: mdHouseholds.redeemedBy,
      createdAt: mdHouseholds.createdAt,
      memberCount: sql<number>`count(${mdRegistrants.id})::int`.as("member_count"),
    })
    .from(mdHouseholds)
    .leftJoin(mdRegistrants, eq(mdRegistrants.householdId, mdHouseholds.id))
    .groupBy(mdHouseholds.id)
    .orderBy(mdHouseholds.reference);
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

export async function getAuditTrail(target?: string, limit = 50): Promise<AuditEntry[]> {
  const whereClause = target
    ? and(eq(auditLog.site, "md"), eq(auditLog.target, target))
    : eq(auditLog.site, "md");

  return db
    .select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorEmail: auditLog.actorEmail,
      action: auditLog.action,
      target: auditLog.target,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(whereClause)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}