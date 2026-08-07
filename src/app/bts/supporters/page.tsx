import { PalmTreeIcon, SchoolBookIcon, TobagoMapBadge } from "@/components/bts-illustrations";

const supporters = [
  {
    name: "THA Division of Health, Wellness and Social Protection",
    role: "Government partner — funding & logistical support",
  },
  {
    name: "Mount St. George Community Council",
    role: "Community outreach & volunteer coordination",
  },
  {
    name: "Goodwood Village Council",
    role: "Venue partnership & local organizing",
  },
  {
    name: "Tobago Business Chamber",
    role: "Corporate donations & supply sponsorship",
  },
  {
    name: "Local Booksellers & Stationers",
    role: "Discounted books and school materials",
  },
  {
    name: "Community Volunteers",
    role: "Sorting, packing, and event-day support",
  },
];

export default function BtsSupportersPage() {
  return (
    <div className="space-y-8">
      <header className="bts-fade-in-up flex flex-col items-center text-center pt-4">
        <div className="mb-4">
          <TobagoMapBadge className="h-20 w-20 drop-shadow-lg" />
        </div>
        <h1 className="text-title text-brand-900">Our Supporters</h1>
        <p className="mt-2 max-w-xl text-body text-brand-800/90">
          Back to School with Megan is made possible by partners who believe every student in
          Tobago deserves to start the school year ready to learn.
        </p>
      </header>

      <section className="mx-auto max-w-4xl">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {supporters.map((s) => (
            <div
              key={s.name}
              className="rounded-card border border-brand-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <PalmTreeIcon className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-brand-900 leading-snug">{s.name}</h3>
              <p className="mt-1 text-xs text-gray-600">{s.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl">
        <div className="rounded-card border border-brand-200 bg-brand-50/60 p-6 sm:p-8 shadow-sm text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm mx-auto">
            <SchoolBookIcon className="h-9 w-9" />
          </div>
          <h2 className="text-lg font-bold text-brand-900">How to support</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Want to help? Donate books or stationery, sponsor a student&rsquo;s supplies, or
            volunteer on event day.
          </p>
          <p className="mt-5 text-sm font-semibold text-brand-800">
            Visit us at the Mount St. George Community Centre.
          </p>
        </div>
      </section>
    </div>
  );
}
