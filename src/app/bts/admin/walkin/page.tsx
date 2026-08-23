import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { BtsRegisterWizard } from "@/components/bts-register-wizard";

export const dynamic = "force-dynamic";

export default async function BtsWalkInPage() {
  const user = await requireAdmin("/bts/admin/walkin");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/walkin" site="bts" />

      <div className="px-5 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
          Walk-In Registration
        </h1>
        <p className="mt-1 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          The same registration flow as the public site, for guardians who arrive
          on event day without pre-registering. Works for one or many children/students.
        </p>
      </div>

      <BtsRegisterWizard mode="walkin" />
    </div>
  );
}
