import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { getAllGuardians } from "@/lib/bts-queries";

export default async function BtsAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const guardians = await getAllGuardians(search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            {guardians.length} registration{guardians.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/bts/admin/reports"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reports →
          </Link>
        </div>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search by guardian name, email, or THA ID…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {guardians.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            {search ? "No registrations match your search." : "No registrations yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>THA ID</Th>
                <Th>Guardian</Th>
                <Th>Contact</Th>
                <Th>Dependents</Th>
                <Th>Registered</Th>
                <Th>View</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {guardians.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-blue-700">
                    {g.thaId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{g.fullName}</div>
                    <div className="text-xs text-gray-500">{g.email ?? "No email"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{g.contactNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {g.dependents.length} student{g.dependents.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {g.createdAt.toLocaleDateString("en-TT", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/bts/admin/${g.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}