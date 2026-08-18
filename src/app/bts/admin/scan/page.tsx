import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { BtsQrScanner } from "./qr-scanner";

export const dynamic = "force-dynamic";

export default async function BtsAdminScanPage() {
  const user = await requireAdmin("/bts/admin/scan");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/scan" site="bts" />

      <div className="bts-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-100 [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">Scan to Verify</h1>
        <p className="mt-1 text-sm text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">
          Scan a registrant&rsquo;s QR code to open their collection view with book lists. Use the manual
          entry fallback if the camera is unavailable.
        </p>
      </div>

      <BtsQrScanner />
    </div>
  );
}