import { db } from "@/db/client";
import { mdRegistrants, users, auditLog } from "@/db/schema";
import { eq, sql, ilike, or, desc, count, and, isNull, isNotNull } from "drizzle-orm";

export type RedemptionStatus = "registered" | "redeemed";

export interface DashboardStats {
  totalRegistrations: number;
  totalRedeemed: number;
  pending: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [regCount] = await db
    .select({ n: count() })
    .from(mdRegistrants)
    .where(isNull(mdRegistrants.deletedAt));
  const [redeemed] = await db
    .select({ n: count() })
    .from(mdRegistrants)
    .where(and(isNull(mdRegistrants.deletedAt), isNotNull(mdRegistrants.redeemedAt)));

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
    .where(isNull(mdRegistrants.deletedAt))
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
      and(
        isNull(mdRegistrants.deletedAt),
        or(
          ilike(mdRegistrants.fullName, pattern),
          ilike(mdRegistrants.thaId, pattern),
          ilike(mdRegistrants.nationalId, pattern),
          ilike(mdRegistrants.phoneNumber, pattern),
        ),
      ),
    )
    .orderBy(desc(mdRegistrants.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    ...r,
    status: r.redeemedAt ? "redeemed" : "registered",
  }));
}

export interface RegistrantDetail {
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
  consent: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  status: RedemptionStatus;
  redeemedAt: Date | null;
  redeemedByName: string | null;
}

export async function getRegistrantById(id: string): Promise<RegistrantDetail | null> {
  const [row] = await db
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
      consent: mdRegistrants.consent,
      deletedAt: mdRegistrants.deletedAt,
      createdAt: mdRegistrants.createdAt,
      updatedAt: mdRegistrants.updatedAt,
      redeemedAt: mdRegistrants.redeemedAt,
      redeemedBy: mdRegistrants.redeemedBy,
    })
    .from(mdRegistrants)
    .where(eq(mdRegistrants.id, id))
    .limit(1);

  if (!row) return null;

  let redeemedByName: string | null = null;
  if (row.redeemedBy) {
    const [u] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, row.redeemedBy))
      .limit(1);
    redeemedByName = u ? u.name ?? u.email ?? row.redeemedBy : row.redeemedBy;
  }

  return {
    id: row.id,
    thaId: row.thaId,
    fullName: row.fullName,
    nationalId: row.nationalId,
    dateOfBirth: row.dateOfBirth,
    address: row.address,
    phoneNumber: row.phoneNumber,
    email: row.email,
    productCategory: row.productCategory,
    productCategoryNote: row.productCategoryNote,
    consent: row.consent,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: row.redeemedAt ? "redeemed" : "registered",
    redeemedAt: row.redeemedAt,
    redeemedByName,
  };
}

export interface DeletedRegistrant {
  id: string;
  thaId: string | null;
  fullName: string;
  phoneNumber: string;
  address: string;
  deletedAt: Date | null;
  createdAt: Date;
}

/** Soft-deleted registrants, newest first, for the hidden deleted tab. */
export async function getDeletedRegistrants(limit = 100): Promise<DeletedRegistrant[]> {
  return db
    .select({
      id: mdRegistrants.id,
      thaId: mdRegistrants.thaId,
      fullName: mdRegistrants.fullName,
      phoneNumber: mdRegistrants.phoneNumber,
      address: mdRegistrants.address,
      deletedAt: mdRegistrants.deletedAt,
      createdAt: mdRegistrants.createdAt,
    })
    .from(mdRegistrants)
    .where(isNotNull(mdRegistrants.deletedAt))
    .orderBy(desc(mdRegistrants.deletedAt))
    .limit(limit);
}

export async function countDeletedRegistrants(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(mdRegistrants)
    .where(isNotNull(mdRegistrants.deletedAt));
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
