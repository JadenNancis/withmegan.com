import { requireAdmin } from "@/lib/require-admin";
import { SITES } from "@/sites/site-registry";
import { LiveStats } from "./live-stats";

export const runtime = "nodejs";

export default async function BtsDashboardPage() {
  const user = await requireAdmin("/bts/admin/dashboard");
  void user;

  const site = SITES.bts;
  const eventDate = new Date(site.eventDate);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 px-6 py-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cyan-200">
            {site.name}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">Event-Day Dashboard · Live</p>
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
          <p className="text-xs text-neutral-500 mt-0.5">Auto-refresh every 10s</p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <LiveStats site="bts" />
      </main>

      <footer className="border-t border-neutral-800/80 px-6 py-4 text-center text-xs text-neutral-600">
        {site.name} · {site.tagline}
      </footer>
    </div>
  );
}