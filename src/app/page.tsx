import Link from "next/link";
import { SITES } from "@/sites/site-registry";

/**
 * Dev-only index. In production, each domain is routed by middleware to its
 * own site root. On localhost (no ?site= override), this page lets you pick
 * which prototype to preview.
 */
export default function DevIndex() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">With Megan — Dev Index</h1>
        <p className="mt-2 text-sm text-gray-600">
          Pick a site to preview. In production each domain routes automatically.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
        {Object.values(SITES).map((site) => (
          <Link
            key={site.key}
            href={`${site.routePrefix}?site=${site.key}`}
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold text-gray-900">{site.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{site.tagline}</p>
            <p className="mt-3 text-xs text-gray-400">{site.host}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}