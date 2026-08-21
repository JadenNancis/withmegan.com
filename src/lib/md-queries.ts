import { db } from "@/db/client";
import { mdRegistrants, auditLog } from "@/db/schema";
import { eq, sql, ilike, or, desc, count, and, isNotNull } from "drizzle-orm";

export type RedemptionStatus = "registered" | "redeemed";

export interface DashboardStats {
  totalRegistrations: number;
  totalRedeemed: number;
  pending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [regCount] = await db.select({ n: count() }).from(mdRegistrants);
  const [redeemed] = await db
    .select({ n: count() })
    .from(mdRegistrants)
    .where(isNotNull(mdRegistrants.redeemedAt));

  const total = regCount?.n ?? 0;
  const redeemedN = redeemed?.n ?? 0;

  return {
    totalRegistrations: total,
    totalRedeemed: redeemedN,
    pending: total - redeemedN,
  };
}

export interface RecentRegistrant {
  id: string;
  thaId: string | null;
  fullName: string;
  status: RedemptionStatus;
  redeemedAt: Date | null;
  createdAt: Date;
}

export async function getRecentRegistrations(limit = 20): Promise<RecentRegistrant[]> {
  const rows = await db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      redeemedAt: mdRegistrants.redeemedAt,
      createdAt: mdRegistrants.createdAt,
    })
    .from(mdRegistrants)
    .orderBy(desc(mdRegistrants.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    ...r,
    status: r.redeemedAt ? "redeemed" : "registered",
  }));
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
  status: RedemptionStatus;
  redeemedAt: Date | null;
  redeemedBy: string | null;
}

export async function searchRegistrants(query: string, limit = 50): Promise<SearchRegistrantResult[]> {
  const pattern = `%${query.trim()}%`;
  const rows = await db
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
      redeemedAt: mdRegistrants.redeemedAt,
      redeemedBy: mdRegistrants.redeemedBy,
    })
    .from(mdRegistrants)
    .where(
      or(
        ilike(mdRegistrants.fullName, pattern),
        ilike(mdRegistrants.thaId, pattern),
        ilike(mdRegistrants.nationalId, pattern),
        ilike(mdRegistrants.phoneNumber, pattern),
      ),
    )
    .orderBy(desc(mdRegistrants.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    ...r,
    status: r.redeemedAt ? "redeemed" : "registered",
  }));
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
