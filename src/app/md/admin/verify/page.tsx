import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { VerifyCounter } from "@/components/verify-counter";

export const dynamic = "force-dynamic";

export default async function MdAdminVerifyPage() {
  const user = await requireAdmin("/md/admin/verify");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/verify" />
      <div className="md-animate-fade-in-up px-5 py-4">
        <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Check-in Counter</h1>
        <p className="mt-1 text-sm text-amber-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Event-day hamper distribution. Search, verify, and authorize collection for each registered resident.
        </p>
      </div>
      <VerifyCounter />
    </div>
  );
}