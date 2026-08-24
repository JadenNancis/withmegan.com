import { PalmTreeIcon, SchoolBookIcon, TobagoMapBadge } from "@/components/bts-illustrations";

const supporters: { name: string; role: string; email?: string }[] = [
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
    role: "Corporate donations & supply sponsorship",
  },
  {
    name: "Windies Wholesalers",
    role: "Corporate partner: wholesale & supply support",
    email: "wimart@windiesgroup.com",
  },
  {
    name: "Windies Media",
    role: "Media partner: promotion & event coverage",
    email: "media@windiesgroup.com",
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

// 2026 Bookdrive sponsors — appended from the official sponsor list.
const sponsors: string[] = [
  "A.B.A Mini Mart",
  "Asha's Eco Resort Tobago",
  "Bethel Credit Union Cooperative Society Ltd",
  "Books and Office Supplies",
  "Comfort Inn & Suites",
  "Coss Cutters Supermarket",
  "D #1 Hardware",
  "Division of Community Development, Youth Development and Sport",
  "Double B Enterprise",
  "Educators Book Store",
  "The Esplanade",
  "Fireball Local Chinese Restaurant",
  "Georgia Boyz Auto Parts",
  "IADPA Bookstore",
  "Independence Store LTD",
  "Johnny Q Sound Hardware",
  "K. Moore Auto Plus",
  "Lambeau Credit Union",
  "M3K Mini Mart",
  "Midway Mini Mart",
  "Mustapha's Motor Services",
  "Nelson's Bookstore",
  "Pages Bookstore",
  "Party Hearty Cater Smart",
  "Penny Savers",
  "Police Credit Union",
  "Public Demand Market Place",
  "Richard's Hardware",
  "Roxie's Roti Shop",
  "Save Value Supermarket",
  "Sharon's Kountry Side Mini Mart",
  "Singh's Hardware",
  "Smart City Supermarket",
  "Studley Park Enterprise LTD",
  "Studley Park Variety Store",
  "Telecommunication Services of Trinidad and Tobago",
  "Tobago Conference of SDA",
  "Tobago Glass Supplies Ltd",
  "Tobago Hospitality and Tourism Institute",
  "Tobago Tourism Agency",
  "Trinidad & Tobago Solid Waste Management Company",
  "Viewport Supermarket",
  "Waterfront Pharmacy",
  "Williams Auto and Gas Supplies",
];

export default function BtsSupportersPage() {
  return (
    <div className="space-y-0">
      {/* Header */}
      <section className="motion-safe:bts-fade-in-up flex flex-col items-center text-center py-8 px-6">
        <div className="mb-6 motion-safe:bts-float">
          <TobagoMapBadge className="h-24 w-24 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Our Supporters</h1>
        <p className="mt-4 max-w-2xl text-base text-brand-100/90 leading-relaxed [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Back to School with Megan is made possible by the generosity of partners who believe every
          child/student in Tobago deserves to start the school year ready to learn.
        </p>
      </section>

      {/* Supporters heading — full-bleed background */}
      <section className="-mx-4 bg-gradient-to-b from-cyan-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="motion-safe:bts-fade-in-up mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-900">This programme is supported by</h2>
            <p className="mt-2 text-sm text-gray-600">
              We are deeply grateful to every organization and individual listed below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supporters.map((s, i) => (
              <div
                key={s.name}
                className={`motion-safe:bts-fade-in-up bts-stagger-${Math.min(i + 1, 6)} rounded-2xl border border-brand-100 bg-white p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-50">
                  <PalmTreeIcon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-brand-900 leading-snug">{s.name}</h3>
                <p className="mt-1 text-xs text-gray-600">{s.role}</p>
                {s.email ? (
                  <a
                    href={`mailto:${s.email}`}
                    className="mt-2 inline-block text-xs font-medium text-brand-700 underline underline-offset-2 break-all hover:text-brand-900"
                  >
                    {s.email}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2026 Bookdrive sponsors — appended from the official list */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="motion-safe:bts-fade-in-up mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_4px_18px_rgba(0,0,0,0.65)]">
              2026 Bookdrive Sponsors
            </h2>
            <p className="mt-2 text-sm text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_2px_10px_rgba(0,0,0,0.6)]">
              Thank you to every business and organization whose generosity makes this drive possible.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((name, i) => (
              <li
                key={name}
                className={`motion-safe:bts-fade-in-up bts-stagger-${Math.min((i % 6) + 1, 6)} flex items-center gap-3 rounded-xl border border-brand-100 bg-white/95 px-4 py-3.5 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg`}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600"
                />
                <span className="text-sm font-semibold text-brand-900 leading-snug">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to support CTA — same gradient background treatment */}
      <section className="py-12">
        <div
          className="motion-safe:bts-fade-in-up mx-auto max-w-2xl rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-lg sm:p-8 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 shadow-sm mx-auto">
            <SchoolBookIcon className="h-9 w-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-900">How to Support</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Want to help next year&rsquo;s book drive? There are many ways to contribute: donate books
            or stationery, sponsor a child/student&rsquo;s supplies, or volunteer on event day.
          </p>
          <div className="mx-auto mt-6 grid max-w-sm gap-2 text-left text-sm text-brand-900">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold">Phone:</span>
              <a
                href="tel:+18682423871"
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900"
              >
                (868) 242-3871
              </a>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold">Email:</span>
              <a
                href="mailto:morrisondistrictoffice@gmail.com"
                className="font-medium break-all text-brand-700 underline underline-offset-2 hover:text-brand-900"
              >
                morrisondistrictoffice@gmail.com
              </a>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold">Visit:</span>
              <span className="font-medium">Mt. St. George / Goodwood District Office</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}