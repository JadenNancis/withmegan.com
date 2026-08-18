import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { VolunteerManager } from "@/components/volunteer-manager";
import { BasketIcon } from "@/components/md-illustrations";

export const dynamic = "force-dynamic";

export default async function MdAdminVolunteersPage() {
  await requireAdmin("/md/admin/volunteers");

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/volunteers" site="md" />

      <div className="md-animate-fade-in-up flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm shrink-0">
          <BasketIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Volunteers</h1>
          <p className="mt-0.5 text-sm text-amber-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            Approve sign-ups, assign shifts, and build the event-day roster.
          </p>
        </div>
      </div>

      <VolunteerManager site="md" accent="amber" />
    </div>
  );
}
