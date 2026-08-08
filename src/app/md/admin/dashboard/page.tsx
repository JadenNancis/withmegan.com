import { requireAdmin } from "@/lib/require-admin";
import { SITES } from "@/sites/site-registry";
import { AdminNav } from "@/components/admin-nav";
import { LiveStats } from "./live-stats";

export const runtime = "nodejs";

export default async function MdDashboardPage() {
  const user = await requireAdmin("/md/admin/dashboard");
  void user;

  const site = SITES.md;
  const eventDate = new Date(site.eventDate);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <AdminNav current="/md/admin/dashboard" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-300">
            {site.name}
          </h1>
          <p className="text-sm text-slate-400">Event-Day Dashboard · Live</p>
        </div>
        <div className="text-right">
          <p className="text-lg sm:text-xl font-semibold text-white">
            {eventDate.toLocaleDateString("en-TT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-slate-400">Projected view · auto-refresh every 10s</p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <LiveStats site="md" />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/60 px-6 py-3 text-center text-xs text-slate-500">
        {site.name} · {site.tagline}
      </footer>
    </div>
  );
}