import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { UserManager } from "@/components/user-manager";

export default async function BtsAdminUsersPage() {
  await requireAdmin("/bts/admin/users", "admin");

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/users" site="bts" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Approve, revoke, and manage staff accounts. Admin only.
        </p>
      </div>
      <UserManager />
    </div>
  );
}