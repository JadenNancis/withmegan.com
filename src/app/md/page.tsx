import Link from "next/link";
import { SITES } from "@/sites/site-registry";

export default function MdLanding() {
  const site = SITES.md;
  const eventDate = new Date(site.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-TT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 sm:p-12 text-white shadow-lg">
        <p className="text-amber-100 text-sm font-semibold uppercase tracking-wide">
          THA-Supported Community Initiative
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
          {site.name}
        </h1>
        <p className="mt-3 text-lg text-amber-50 max-w-xl">
          {site.tagline}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/md/register"
            className="inline-flex justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
          >
            Register for a hamper
          </Link>
          <Link
            href="/md/admin"
            className="inline-flex justify-center rounded-lg border-2 border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Admin dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-3xl font-bold text-amber-700">{formattedDate}</p>
          <p className="mt-1 text-sm text-amber-800">Event date</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-3xl font-bold text-gray-900">2</p>
          <p className="mt-1 text-sm text-gray-600">Distribution centres</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-3xl font-bold text-gray-900">Free</p>
          <p className="mt-1 text-sm text-gray-600">For registered residents</p>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900">About the initiative</h2>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          Market Day with Megan is a community hamper distribution initiative serving
          residents of Mount St. George and Goodwood, Tobago. Each eligible household
          receives a hamper of essential goods. Registration is open in advance &mdash;
          once registered, you&apos;ll be assigned to a household group for verification
          and collection on the day.
        </p>
        <h3 className="mt-6 text-sm font-semibold text-gray-900">How it works</h3>
        <ol className="mt-2 space-y-2 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</span>
            <span>Register online with your name, address, and contact details.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span>
            <span>Receive your unique THA ID and household reference.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</span>
            <span>Bring your ID on event day for verification at the distribution counter.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">4</span>
            <span>Collect your hamper &mdash; one per household.</span>
          </li>
        </ol>
      </section>

      <section className="rounded-xl bg-amber-600 p-6 text-center text-white">
        <p className="text-lg font-semibold">Ready to register?</p>
        <p className="mt-1 text-sm text-amber-50">
          It takes less than five minutes.
        </p>
        <Link
          href="/md/register"
          className="mt-4 inline-flex rounded-lg bg-white px-6 py-3 text-base font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
        >
          Register now
        </Link>
      </section>
    </div>
  );
}