import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { UserManager } from "@/components/user-manager";

export default async function MdAdminUsersPage() {
  await requireAdmin("/md/admin/users", "admin");

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/users" />
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">User Management</h1>
        <p className="mt-1 text-sm text-amber-100/90 drop-shadow-sm">
          Approve, revoke, and manage staff accounts. Admin only.
        </p>
      </div>
      <UserManager />
    </div>
  );
}