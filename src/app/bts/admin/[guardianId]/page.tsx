import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { getGuardianWithDependents, getAuditTrailForGuardian } from "@/lib/bts-queries";
import { AdminNav } from "@/components/admin-nav";
import { AssignmentPanel } from "./assignment-panel";
import { BookListViewer } from "./book-list-viewer";

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
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>🪪 {guardian.nationalId ?? "N/A"}</p>
            <p>📞 {guardian.contactNumber}</p>
            <p>✉️ {guardian.email}</p>
            <p>📍 {guardian.address}</p>
            <p className="mt-1 text-xs text-gray-400">
              Registered {guardian.createdAt.toLocaleDateString("en-TT")}
            </p>
          </div>
        </div>
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
    </div>
  );
}