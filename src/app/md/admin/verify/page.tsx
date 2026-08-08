import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { VerifyCounter } from "@/components/verify-counter";
import { SunsetWaveDivider } from "@/components/md-illustrations";

export default async function MdAdminVerifyPage() {
  const user = await requireAdmin("/md/admin/verify");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/verify" />
      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />
      <div className="md-animate-fade-in-up rounded-2xl border border-white/25 bg-amber-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Verification Counter</h1>
        <p className="mt-1 text-sm text-amber-100/90">
          Real-time hamper distribution control. Search, verify, and authorize. One hamper per household.
        </p>
      </div>
      <VerifyCounter />
    </div>
  );
}