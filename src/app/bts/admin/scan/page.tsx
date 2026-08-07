import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { WaveDivider } from "@/components/bts-illustrations";
import { BtsQrScanner } from "./qr-scanner";

export const dynamic = "force-dynamic";

export default async function BtsAdminScanPage() {
  const user = await requireAdmin("/bts/admin/scan");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/scan" site="bts" />

      <WaveDivider className="-mx-4 -mt-8 mb-2 h-10 w-[calc(100%+2rem)] overflow-hidden" />

      <div className="bts-fade-in-up">
        <h1 className="text-2xl font-bold text-cyan-900">Scan to Verify</h1>
        <p className="mt-1 text-sm text-gray-600">
          Scan a registrant&rsquo;s QR code to open their verification page. Use the manual
          entry fallback if the camera is unavailable.
        </p>
      </div>

      <BtsQrScanner />
    </div>
  );
}