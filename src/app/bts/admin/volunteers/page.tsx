import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { VolunteerManager } from "@/components/volunteer-manager";
import { SchoolBookIcon } from "@/components/bts-illustrations";

export const dynamic = "force-dynamic";

export default async function BtsAdminVolunteersPage() {
  await requireAdmin("/bts/admin/volunteers");

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/volunteers" site="bts" />

      <div className="bts-fade-in-up flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm shrink-0">
          <SchoolBookIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Volunteers</h1>
          <p className="mt-0.5 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            Approve sign-ups, assign shifts, and build the event-day roster.
          </p>
        </div>
      </div>

      <VolunteerManager site="bts" accent="cyan" />
    </div>
  );
}
