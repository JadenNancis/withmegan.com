import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { HouseholdManager } from "@/components/household-manager";
import { getHouseholds, getAuditTrail } from "@/lib/md-queries";
import { mdRegistrants } from "@/db/schema";
import { db } from "@/db/client";
import { isNull } from "drizzle-orm";
import { SunsetWaveDivider } from "@/components/md-illustrations";

export default async function MdAdminHouseholdsPage() {
  const user = await requireAdmin("/md/admin/households");
  void user;

  const [households, audit, unassignedRows] = await Promise.all([
    getHouseholds(),
    getAuditTrail(undefined, 30),
    db
      .select({
        id: mdRegistrants.id,
        thaId: mdRegistrants.thaId,
        fullName: mdRegistrants.fullName,
      })
      .from(mdRegistrants)
      .where(isNull(mdRegistrants.householdId))
      .orderBy(mdRegistrants.createdAt),
  ]);

  const hh = households.map((h) => ({
    ...h,
    redeemedAt: h.redeemedAt ? h.redeemedAt.toISOString() : null,
    redeemedBy: h.redeemedBy,
    createdAt: h.createdAt.toISOString(),
  }));

  const auditSerialised = audit.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  const unassigned = unassignedRows.map((r) => ({
    ...r,
    householdReference: null,
  }));

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/households" />
      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />
      <div className="rounded-2xl border border-white/25 bg-amber-950/55 backdrop-blur-md px-5 py-4 shadow-lg md-animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Household Management</h1>
      </div>
      <HouseholdManager households={hh} unassigned={unassigned} audit={auditSerialised} />
    </div>
  );
}