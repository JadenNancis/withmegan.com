import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { WalkInForm } from "./walkin-form";

export default async function MdWalkInPage() {
  const user = await requireAdmin("/md/admin/walkin");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/walkin" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold text-white md-animate-fade-in-up [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Walk-In Quick Registration</h1>
          <p className="mt-1 text-sm text-amber-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            For people who arrive on event day without pre-registering. Quick entry with minimal fields.
          </p>
        </div>
        <a
          href="/md/admin/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 transition-colors min-h-[44px]"
        >
          Dashboard &rarr;
        </a>
      </div>

      <WalkInForm />
    </div>
  );
}