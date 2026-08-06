import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { getGuardianWithDependents, getAuditTrailForGuardian } from "@/lib/bts-queries";
import { AssignmentPanel } from "./assignment-panel";
import { BookListViewer } from "./book-list-viewer";

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
      <div>
        <Link href="/bts/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 py-1">
          ← Back to dashboard
        </Link>
      </div>

      {/* Guardian summary */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{guardian.fullName}</h1>
            <p className="mt-1 font-mono text-sm font-medium text-blue-700">
              {guardian.thaId ?? "No THA ID"}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <p>📞 {guardian.contactNumber}</p>
            <p>✉️ {guardian.email}</p>
            <p>🏠 {guardian.address}</p>
            <p className="mt-1 text-xs text-gray-400">
              Registered {guardian.createdAt.toLocaleDateString("en-TT")}
            </p>
          </div>
        </div>
      </section>

      {/* Dependents + assignments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Dependents ({guardian.dependents.length})
        </h2>
        {guardian.dependents.map((dep) => (
          <div key={dep.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{dep.studentName}</h3>
                <p className="text-sm text-gray-600">
                  {dep.schoolName} · {dep.gradeLevel}
                </p>
              </div>
              {dep.bookListUrl && (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
                  {dep.bookListUrl.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
                </span>
              )}
            </div>
            {dep.bookListUrl && (
              <BookListViewer bookListUrl={dep.bookListUrl} studentName={dep.studentName} />
            )}
            {dep.notes && (
              <p className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800">
                <strong>Notes:</strong> {dep.notes}
              </p>
            )}
            <AssignmentPanel
              dependentId={dep.id}
              assignments={dep.assignments}
              actorEmail={user.email ?? undefined}
            />
          </div>
        ))}
      </section>

      {/* Audit trail */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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