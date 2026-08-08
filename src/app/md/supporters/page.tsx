import { BasketIcon, CommunityIcon, TobagoMapBadge } from "@/components/md-illustrations";

const supporters = [
  {
    name: "THA Division of Health, Wellness and Social Protection",
    role: "Government partner: funding & logistical support",
  },
  {
    name: "Mt. St. George Community Council",
    role: "Community outreach & volunteer coordination",
  },
  {
    name: "Goodwood Village Council",
    role: "Venue partnership & local organizing",
  },
  {
    name: "Tobago Business Chamber",
    role: "Corporate donations & hamper sponsorship",
  },
  {
    name: "Local Farmers & Provision Suppliers",
    role: "Fresh produce and staple goods",
  },
  {
    name: "Community Volunteers",
    role: "Packing, sorting, and event-day support",
  },
];

export default function MdSupportersPage() {
  return (
    <div className="space-y-0">
      {/* Header */}
      <section className="motion-safe:md-animate-fade-in-up flex flex-col items-center text-center py-8 px-6">
        <div className="mb-6 motion-safe:md-animate-float">
          <TobagoMapBadge className="h-24 w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Our Supporters</h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-amber-100/90 leading-relaxed [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Market Day with Megan is made possible by the generosity of partners who believe every
          household in Tobago deserves access to fresh, nutritious food.
        </p>
      </section>

      {/* Supporters heading — full-bleed background */}
      <section className="-mx-4 bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="motion-safe:md-animate-fade-in-up mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900">This programme is supported by</h2>
            <p className="mt-2 text-sm text-amber-700">
              We are deeply grateful to every organization and individual listed below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supporters.map((s, i) => (
              <div
                key={s.name}
                className={`motion-safe:md-animate-fade-in-up md-delay-${Math.min(i + 1, 5)} rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
                  <BasketIcon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-amber-900 leading-snug">{s.name}</h3>
                <p className="mt-1 text-xs text-gray-600">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to support CTA */}
      <section className="py-12">
        <div className="motion-safe:md-animate-fade-in-up mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm mx-auto">
            <CommunityIcon className="h-9 w-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-900">How to Support</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Want to help future distributions? There are many ways to contribute: sponsor a hamper,
            donate provisions, or volunteer on event day.
          </p>
          <div className="mt-6 space-y-2 text-sm text-amber-800">
            <p>
              <span className="font-semibold">Phone:</span> (868) 639-XXXX
            </p>
            <p>
              <span className="font-semibold">Email:</span> marketday@withmegan.tha.tt
            </p>
            <p>
              <span className="font-semibold">Visit:</span> Mt. St. George Community Centre
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}