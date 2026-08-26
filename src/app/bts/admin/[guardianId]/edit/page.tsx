import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { getGuardianWithDependents } from "@/lib/bts-queries";
import { AdminNav } from "@/components/admin-nav";
import { EditApplicationForm } from "../edit-application-form";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ guardianId: string }>;
}) {
  await requireAdmin("/bts/admin");
  const { guardianId } = await params;
  const guardian = await getGuardianWithDependents(guardianId);

  if (!guardian || guardian.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin" site="bts" />
      <EditApplicationForm guardian={guardian} />
    </div>
  );
}
