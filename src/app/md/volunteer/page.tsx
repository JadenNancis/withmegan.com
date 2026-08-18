import { VolunteerSignupForm } from "@/components/volunteer-signup-form";
import { BasketIcon } from "@/components/md-illustrations";

export const dynamic = "force-dynamic";

export default function MdVolunteerPage() {
  return (
    <div className="-mx-4 -my-5 sm:-my-8 space-y-0">
      {/* Full-bleed hero band */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-900/80 via-amber-950/60 to-transparent px-6 py-12 sm:py-16">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="motion-safe:md-animate-fade-in-up mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/25 backdrop-blur-sm shadow-lg">
            <BasketIcon className="h-10 w-10 text-amber-100" />
          </div>
          <h1 className="motion-safe:md-animate-fade-in-up text-3xl sm:text-4xl font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
            Volunteer for Market Day
          </h1>
          <p className="motion-safe:md-animate-fade-in-up mt-3 max-w-xl mx-auto text-sm sm:text-base text-amber-100/90 leading-relaxed [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            Help us fill hampers and bring the community market to life across the Electoral
            District of Mt. St. George/Goodwood. Volunteers sort, pack and distribute with a smile.
          </p>
        </div>
      </section>

      {/* Form card */}
      <section className="mx-auto max-w-xl px-4 pb-12 sm:pb-16">
        <div className="motion-safe:md-animate-fade-in-up overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]">
          <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/50 px-6 py-4">
            <h2 className="text-base font-bold text-amber-900">Sign up to volunteer</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Takes under a minute. We&rsquo;ll confirm your shift with you directly.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <VolunteerSignupForm site="md" accent="amber" cta="Sign up to volunteer" />
          </div>
        </div>
      </section>
    </div>
  );
}
