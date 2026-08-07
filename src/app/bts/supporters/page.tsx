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
    <div className="space-y-0">
      {/* Header */}
      <section className="bts-fade-in-up flex flex-col items-center text-center py-8">
        <div className="mb-6 bts-float">
          <TobagoMapBadge className="h-24 w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-cyan-900">Our Supporters</h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-cyan-800 leading-relaxed">
          Back to School with Megan is made possible by the generosity of partners who believe every
          student in Tobago deserves to start the school year ready to learn.
        </p>
      </section>

      {/* Supporters heading — full-bleed background */}
      <section className="-mx-4 bg-gradient-to-b from-cyan-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bts-fade-in-up mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-900">This initiative is supported by</h2>
            <p className="mt-2 text-sm text-cyan-700">
              We are deeply grateful to every organization and individual listed below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supporters.map((s, i) => (
              <div
                key={s.name}
                className={`bts-fade-in-up bts-stagger-${Math.min(i + 1, 6)} rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50">
                  <PalmTreeIcon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-cyan-900 leading-snug">{s.name}</h3>
                <p className="mt-1 text-xs text-gray-600">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to support CTA */}
      <section className="py-12">
        <div className="bts-fade-in-up mx-auto max-w-2xl rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm sm:p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-sm mx-auto">
            <SchoolBookIcon className="h-9 w-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-900">How to Support</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Want to help next year&rsquo;s book drive? There are many ways to contribute — donate books
            or stationery, sponsor a student&rsquo;s supplies, or volunteer on event day.
          </p>
          <div className="mt-6 space-y-2 text-sm text-cyan-800">
            <p>
              <span className="font-semibold">Phone:</span> (868) 639-XXXX
            </p>
            <p>
              <span className="font-semibold">Email:</span> backtoschool@withmegan.tha.tt
            </p>
            <p>
              <span className="font-semibold">Visit:</span> Mount St. George Community Centre
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}