import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { UserManager } from "@/components/user-manager";

export default async function BtsAdminUsersPage() {
  await requireAdmin("/bts/admin/users", "admin");

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/users" site="bts" />
      <div className="rounded-2xl border border-white/25 bg-brand-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">User Management</h1>
        <p className="mt-1 text-sm text-brand-100/90">
          Approve, revoke, and manage staff accounts. Admin only.
        </p>
      </div>
      <UserManager />
    </div>
  );
}