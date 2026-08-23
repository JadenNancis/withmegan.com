import { BtsRegisterWizard } from "@/components/bts-register-wizard";

export const dynamic = "force-dynamic";

export default function BtsRegisterPage() {
  return (
    <div className="space-y-5">
      <div
        className="motion-safe:bts-fade-in-up -mx-4 -my-5 sm:-my-8 rounded-none overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
      >
        <div className="bg-brand-900/55 backdrop-blur-sm px-5 py-8 sm:px-6 sm:py-10 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-white leading-snug drop-shadow-md">
            Register a family for Back to School
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-100 drop-shadow-sm">
            Free books and supplies for every child/student. Three minutes, three steps.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-50 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Registrations close Friday, 28th August at 12 p.m.
          </p>
        </div>
      </div>
      {/* Spacer — the Tobago photo breathes between hero and step tracker */}
      <div className="h-8 sm:h-10" aria-hidden="true" />
      <BtsRegisterWizard mode="public" />
    </div>
  );
}
