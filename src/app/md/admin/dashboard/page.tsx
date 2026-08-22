import { requireAdmin } from "@/lib/require-admin";
import { SITES, parseEventDate } from "@/sites/site-registry";
import { AdminNav } from "@/components/admin-nav";
import { LiveStats } from "./live-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MdDashboardPage() {
  const user = await requireAdmin("/md/admin/dashboard");
  void user;

  const site = SITES.md;
  const eventDate = parseEventDate(site.eventDate);

  return (
    <div className="min-h-screen text-white flex flex-col">
      <AdminNav current="/md/admin/dashboard" />

      {/* Header — translucent dark glass over the photo */}
      <header className="border-b border-white/20 bg-amber-950/40 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-300 [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
            {site.name}
          </h1>
          <p className="text-sm text-amber-100/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Event-Day Dashboard · Live</p>
        </div>
        <div className="text-right">
          <p className="text-lg sm:text-xl font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            {eventDate.toLocaleDateString("en-TT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-amber-100/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Projected view · auto-refresh every 10s</p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <LiveStats site="md" />
      </main>

      <footer className="border-t border-white/20 bg-amber-950/40 backdrop-blur-md px-6 py-3 text-center text-xs text-amber-100/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
        {site.name} · {site.tagline}
      </footer>
    </div>
  );
}