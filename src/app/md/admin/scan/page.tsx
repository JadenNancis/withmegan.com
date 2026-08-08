import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { MdQrScanner } from "./qr-scanner";

export const dynamic = "force-dynamic";

/**
 * MD admin scan-to-verify page.
 *
 * Auth-gated server component shell; the camera logic lives in the
 * client component <MdQrScanner />.
 */
export default async function MdAdminScanPage() {
  const user = await requireAdmin("/md/admin/scan");
  void user;

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/scan" />

      <div className="md-animate-fade-in-up px-5 py-4">
        <h1 className="text-2xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Scan to Verify</h1>
        <p className="mt-1 text-sm text-amber-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Scan a registrant&rsquo;s QR code to open their verification page. Use the manual
          entry fallback if the camera is unavailable.
        </p>
      </div>

      <MdQrScanner />
    </div>
  );
}