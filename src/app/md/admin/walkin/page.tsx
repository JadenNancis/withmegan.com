import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SunsetWaveDivider } from "@/components/md-illustrations";
import { WalkInForm } from "./walkin-form";

export default async function MdWalkInPage() {
  const user = await requireAdmin("/md/admin/walkin");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/walkin" />
      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="rounded-2xl border border-white/25 bg-amber-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
          <h1 className="text-2xl font-bold text-white drop-shadow-md md-animate-fade-in-up">Walk-In Quick Registration</h1>
          <p className="mt-1 text-sm text-amber-100/90">
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