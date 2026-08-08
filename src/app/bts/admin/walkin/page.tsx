import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { WalkInForm } from "./walkin-form";

export default async function BtsWalkInPage() {
  const user = await requireAdmin("/bts/admin/walkin");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/walkin" site="bts" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="px-5 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Walk-In Quick Registration</h1>
          <p className="mt-1 text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            For guardians who arrive on event day without pre-registering. One dependent only. Add more later from the detail page.
          </p>
        </div>
        <a
          href="/bts/admin/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50 active:scale-95 transition-all min-h-[44px] shrink-0"
        >
          Dashboard &rarr;
        </a>
      </div>

      <WalkInForm />
    </div>
  );
}