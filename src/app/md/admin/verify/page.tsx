import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { VerifyCounter } from "@/components/verify-counter";

export default async function MdAdminVerifyPage() {
  const user = await requireAdmin();
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/verify" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Counter</h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time hamper distribution control. Search, verify, and authorize — one hamper per household.
        </p>
      </div>
      <VerifyCounter />
    </div>
  );
}