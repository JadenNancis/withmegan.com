import Link from "next/link";
import { SITES } from "@/sites/site-registry";

const EVENT_DATE = new Date(SITES.bts.eventDate);

export default function BtsLanding() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-white p-8 sm:p-12 shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Back to School with Megan
        </h1>
        <p className="mt-3 text-lg text-blue-50 max-w-2xl">
          A community book drive ensuring every student in Mount St. George &amp; Goodwood, Tobago
          starts the school year ready to learn. Register your dependents, upload their book lists,
          and we&rsquo;ll help match them with the resources they need.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/bts/register"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
          >
            Register a Student →
          </Link>
          <div className="inline-flex items-center rounded-lg bg-blue-600/40 px-6 py-3 text-base font-medium text-white ring-1 ring-inset ring-white/30">
            <span className="mr-2">📅</span>
            {EVENT_DATE.toLocaleDateString("en-TT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <InfoCard
          step="1"
          title="Register"
          body="Submit your details and your dependents' information through our secure form."
        />
        <InfoCard
          step="2"
          title="Upload Book Lists"
          body="Attach each student's book list (PDF or Word) so we know exactly what's needed."
        />
        <InfoCard
          step="3"
          title="Collect Resources"
          body="Receive a THA ID and collect matched books and supplies at the distribution event."
        />
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-xl font-semibold text-blue-900">About the Initiative</h2>
        <p className="mt-3 text-sm text-blue-800 leading-relaxed">
          Back to School with Megan is a THA-supported community initiative serving families in
          Mount St. George and Goodwood, Tobago. Our goal is to reduce the financial burden of
          back-to-school season by connecting students with the books and learning materials they
          need to succeed. Every registration generates a unique THA ID you can use to track your
          request and collect your resources on event day.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
            📍 Mount St. George &amp; Goodwood, Tobago
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
            🎒 Primary · Secondary · Tertiary
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
            🆓 Free for registered families
          </span>
        </div>
      </section>

      <section className="text-center">
        <Link
          href="/bts/register"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Register a Student Now
        </Link>
        <p className="mt-3 text-xs text-gray-500">
          Questions? Visit us at the community centre or ask on event day.
        </p>
      </section>
    </div>
  );
}

function InfoCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {step}
      </div>
      <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
    </div>
  );
}