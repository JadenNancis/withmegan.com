import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { WaveDivider } from "@/components/bts-illustrations";
import { WalkInForm } from "./walkin-form";

export default async function BtsWalkInPage() {
  const user = await requireAdmin("/bts/admin/walkin");
  void user;

  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-5 sm:-mt-8 mb-2 h-10 overflow-hidden">
        <WaveDivider className="h-10 w-full" preserveAspectRatio="none" />
      </div>

      <AdminNav current="/bts/admin/walkin" site="bts" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="rounded-2xl border border-white/25 bg-brand-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">Walk-In Quick Registration</h1>
          <p className="mt-1 text-sm text-brand-100/90">
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