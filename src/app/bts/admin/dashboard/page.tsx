import { requireAdmin } from "@/lib/require-admin";
import { SITES } from "@/sites/site-registry";
import { AdminNav } from "@/components/admin-nav";
import { LiveStats } from "./live-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BtsDashboardPage() {
  const user = await requireAdmin("/bts/admin/dashboard");
  void user;

  const site = SITES.bts;
  const eventDate = new Date(site.eventDate);

  return (
    <div className="min-h-screen text-white flex flex-col">
      <AdminNav current="/bts/admin/dashboard" site="bts" />

      {/* Header — translucent dark glass over the photo */}
      <header className="border-b border-white/20 bg-brand-950/40 backdrop-blur-md px-4 py-4 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-cyan-200 [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">
            {site.name}
          </h1>
          <p className="text-sm text-cyan-100/90 mt-0.5 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Event-Day Dashboard · Live</p>
        </div>
        <div className="sm:text-right">
          <p className="text-base sm:text-xl font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            {eventDate.toLocaleDateString("en-TT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-cyan-100/70 mt-0.5 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Auto-refresh every 10s</p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <LiveStats site="bts" />
      </main>

      <footer className="border-t border-white/20 bg-brand-950/40 backdrop-blur-md px-6 py-4 text-center text-xs text-cyan-100/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
        {site.name} · {site.tagline}
      </footer>
    </div>
  );
}