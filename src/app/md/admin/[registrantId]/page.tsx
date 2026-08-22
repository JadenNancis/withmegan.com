import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { getRegistrantById, getAuditTrail } from "@/lib/md-queries";
import { AdminNav } from "@/components/admin-nav";
import { cn } from "@/lib/cn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MdRegistrantDetailPage({
  params,
}: {
  params: Promise<{ registrantId: string }>;
}) {
  await requireAdmin("/md/admin");
  const { registrantId } = await params;
  const registrant = await getRegistrantById(registrantId);

  if (!registrant) notFound();

  const auditTrail = registrant.thaId
    ? await getAuditTrail(`registration:${registrant.thaId}`).catch(() => [])
    : [];

  const redeemed = registrant.status === "redeemed";

  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin" />

      {/* Registrant summary */}
      <section className="rounded-xl border border-amber-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {registrant.fullName}
              </h1>
              <span
                className={cn(
                  "inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  redeemed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700",
                )}
              >
                {redeemed ? "redeemed" : "registered"}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm font-medium text-amber-700 break-all">
              {registrant.thaId ?? "No Application ID"}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Registered{" "}
            {registrant.createdAt.toLocaleDateString("en-TT", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {registrant.updatedAt.getTime() !== registrant.createdAt.getTime() && (
              <> · updated {registrant.updatedAt.toLocaleDateString("en-TT")}</>
            )}
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detail label="National ID" value={registrant.nationalId ?? "N/A"} mono />
          <Detail label="Date of birth" value={registrant.dateOfBirth ?? "N/A"} />
          <Detail label="Community" value={registrant.address} />
          <Detail label="Phone number" value={registrant.phoneNumber} />
          <Detail label="Email" value={registrant.email ?? "N/A"} />
          <Detail
            label="Product category"
            value={registrant.productCategory ?? "N/A"}
          />
          {registrant.productCategoryNote && (
            <Detail label="Category note" value={registrant.productCategoryNote} wide />
          )}
          <Detail
            label="Consent"
            value={registrant.consent ? "Given" : "Not given"}
          />
        </dl>

        {redeemed && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-semibold">Hamper collected</p>
            <p className="mt-0.5">
              {registrant.redeemedAt
                ? registrant.redeemedAt.toLocaleString("en-TT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Collected"}
              {registrant.redeemedByName && <> by {registrant.redeemedByName}</>}
            </p>
          </div>
        )}
      </section>

      {/* Audit trail */}
      <section className="rounded-xl border border-amber-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
        {auditTrail.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No audit entries recorded.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {auditTrail.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-start sm:gap-3"
              >
                <span className="font-mono text-xs text-gray-400 sm:mt-0.5">
                  {entry.createdAt.toLocaleString("en-TT")}
                </span>
                <div>
                  <span className="font-medium text-gray-900">{entry.action}</span>
                  <span className="text-gray-500">
                    {" "}by {entry.actorEmail ?? entry.actorId}
                  </span>
                  {entry.target && (
                    <span className="text-gray-400"> → {entry.target}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p>
        <Link
          href="/md/admin"
          className="inline-flex min-h-[44px] items-center text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]"
        >
          &larr; Back to admin dashboard
        </Link>
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3", wide && "sm:col-span-2")}>
      <dt className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className={cn("text-sm font-medium text-gray-900", mono && "font-mono text-xs break-all")}>
        {value}
      </dd>
    </div>
  );
}
