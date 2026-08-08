import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { SunsetWaveDivider } from "@/components/md-illustrations";
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

      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />

      <div className="md-animate-fade-in-up rounded-2xl border border-white/25 bg-amber-950/55 backdrop-blur-md px-5 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Scan to Verify</h1>
        <p className="mt-1 text-sm text-amber-100/90">
          Scan a registrant&rsquo;s QR code to open their verification page. Use the manual
          entry fallback if the camera is unavailable.
        </p>
      </div>

      <MdQrScanner />
    </div>
  );
}