import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { getGuardianWithDependents, getAuditTrailForGuardian } from "@/lib/bts-queries";
import { AdminNav } from "@/components/admin-nav";
import { AssignmentPanel } from "./assignment-panel";
import { BookListViewer } from "./book-list-viewer";
import { DeleteRegistrantButton } from "@/components/registrant-actions";

export const dynamic = "force-dynamic";

export default async function GuardianDetailPage({
  params,
}: {
  params: Promise<{ guardianId: string }>;
}) {
  const user = await requireAdmin("/bts/admin/[guardianId]");
  const { guardianId } = await params;
  const guardian = await getGuardianWithDependents(guardianId);

  if (!guardian) notFound();

  const auditTrail = await getAuditTrailForGuardian(guardian);

  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin" site="bts" />

      {/* Guardian summary */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{guardian.fullName}</h1>
            <p className="mt-1 font-mono text-sm font-medium text-blue-700 break-all">
              {guardian.thaId ?? "No Application ID"}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>🪪 {guardian.nationalId ?? "N/A"}</p>
              <p>📞 {guardian.contactNumber}</p>
              <p>✉️ {guardian.email}</p>
              <p>📍 {guardian.address}</p>
              <p className="mt-1 text-xs text-gray-600">
                Registered {guardian.createdAt.toLocaleDateString("en-TT")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!guardian.deletedAt && (
                <Link
                  href={`/bts/admin/${guardian.id}/edit`}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 transition-all hover:bg-blue-50 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Edit details
                </Link>
              )}
              {!guardian.deletedAt && (
                <DeleteRegistrantButton site="bts" id={guardian.id} redirectTo="/bts/admin" />
              )}
            </div>
          </div>
        </div>
        {guardian.deletedAt && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            This registration is deleted. It only appears on the deleted tab and will be
            hidden from all counts and check-in screens.
          </p>
        )}
      </section>

      {/* Dependents + assignments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white drop-shadow-md">
          Dependents ({guardian.dependents.length})
        </h2>
        {guardian.dependents.map((dep) => (
          <div key={dep.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            {/* Header row — name + school/grade on left, file badge on right */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{dep.studentName}</h3>
                <p className="text-sm text-gray-600">
                  {dep.schoolName} · {dep.gradeLevel}
                </p>
              </div>
              {dep.bookListUrl && (
                <span className="inline-flex shrink-0 items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                  {dep.bookListUrl.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
                </span>
              )}
            </div>

            {/* Book list viewer — uniform spacing from header */}
            {dep.bookListUrl && (
              <div className="mt-4">
                <BookListViewer bookListUrl={dep.bookListUrl} studentName={dep.studentName} />
              </div>
            )}

            {/* Notes — only if present */}
            {dep.notes && (
              <div className="mt-4">
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  <strong>Notes:</strong> {dep.notes}
                </p>
              </div>
            )}

            {/* Assignment panel — uniform top divider */}
            <div className="mt-4">
              <AssignmentPanel
                dependentId={dep.id}
                assignments={dep.assignments}
                actorEmail={user.email ?? undefined}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Audit trail */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
        {auditTrail.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No audit entries recorded.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {auditTrail.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-start sm:gap-3">
                <span className="font-mono text-xs text-gray-600 sm:mt-0.5">
                  {entry.createdAt.toLocaleString("en-TT")}
                </span>
                <div>
                  <span className="font-medium text-gray-900">{entry.action}</span>
                  <span className="text-gray-500">
                    {" "}by {entry.actorEmail ?? entry.actorId}
                  </span>
                  {entry.target && (
                    <span className="text-gray-600"> → {entry.target}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}