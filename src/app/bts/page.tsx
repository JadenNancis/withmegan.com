import Image from "next/image";
import Link from "next/link";
import { SITES } from "@/sites/site-registry";
import {
  TobagoBooksHero,
  PalmTreeIcon,
  PelicanIcon,
  SchoolBookIcon,
  TobagoMapBadge,
} from "@/components/bts-illustrations";
import { db } from "@/db/client";
import { btsGuardians } from "@/db/schema";
import { count } from "drizzle-orm";

const site = SITES.bts;
const EVENT_DATE = new Date(site.eventDate + "T12:00:00");

async function getRegistrationCount(): Promise<number> {
  try {
    const [row] = await db.select({ n: count() }).from(btsGuardians);
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

export default async function BtsLanding() {
  const registered = await getRegistrationCount();
  const pct = Math.min(100, Math.round((registered / site.goalFamilies) * 100));

  return (
    <div className="-mx-4 -my-6 sm:-my-8 space-y-0">
      {/* ===== Hero — single photo, one message, two actions ===== */}
      <section className="relative overflow-hidden bg-brand-950">
        <Image
          src="/images/tobago/bts-child-reading.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-900/60 to-brand-950/90" />

        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:py-20 text-center text-white">
          <span className="bts-fade-in-up bts-stagger-1 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-100 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            The Electoral District of Mt. St. George/Goodwood
          </span>
          <h1 className="bts-fade-in-up bts-stagger-2 mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
            Back to School with Megan
          </h1>
          <p className="bts-fade-in-up bts-stagger-3 mt-4 text-base sm:text-lg text-brand-100 max-w-xl mx-auto leading-relaxed">
            Free books and supplies for every student in the constituency.
            Register in three minutes — we&rsquo;ll match each child with what they need.
          </p>

          <div className="bts-fade-in-up bts-stagger-3 mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-brand-50 ring-1 ring-inset ring-white/20">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {EVENT_DATE.toLocaleDateString("en-TT", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="bts-fade-in-up bts-stagger-4 mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:items-center">
            <Link
              href="/bts/register"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-brand-800 shadow-lg hover:bg-brand-50 transition-colors"
            >
              Register a Student
            </Link>
            <Link
              href="/bts/recover"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-transparent px-8 text-base font-semibold text-white ring-2 ring-inset ring-white/40 hover:bg-white/10 transition-colors"
            >
              Find My Application ID
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Live progress teaser ===== */}
      <section className="bg-white border-b border-brand-100">
        <Link
          href="/bts/progress"
          className="mx-auto max-w-4xl px-4 py-6 flex items-center gap-4 group"
        >
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-brand-900">
                <span className="text-2xl font-bold">{registered}</span>
                <span className="text-brand-500"> / {site.goalFamilies} families registered</span>
              </p>
              <p className="text-sm font-bold text-brand-600">{pct}%</p>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                style={{ width: `${Math.max(3, pct)}%` }}
              />
            </div>
          </div>
          <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* ===== How it works — snap-scroll cards on mobile ===== */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <h2 className="text-title text-brand-900 text-center">Three steps, three minutes</h2>
        <p className="mt-2 text-body text-brand-700 text-center">
          Everything happens right here on your phone.
        </p>

        <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
          <StepCard
            step="1"
            title="Register"
            body="Your name, phone number, and community. That&rsquo;s all we need about you."
          />
          <StepCard
            step="2"
            title="Add your students"
            body="Each child&rsquo;s school and grade. Attach their book list if you have one — or skip it."
          />
          <StepCard
            step="3"
            title="Get your ID"
            body="We message you an Application ID with a QR code. Show it on event day to collect."
          />
        </div>
      </section>

      {/* ===== About — the SVG hero lives here, away from the photo ===== */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
            <div className="bts-float order-first sm:order-last mx-auto max-w-xs sm:max-w-none">
              <TobagoBooksHero className="w-full h-auto drop-shadow-xl" />
            </div>
            <div>
              <h2 className="text-title text-brand-900">About the initiative</h2>
              <p className="mt-3 text-body text-brand-800/90 leading-relaxed">
                Back to School with Megan is a THA-supported community initiative serving
                the Electoral District of Mt. St. George/Goodwood. We connect students with the books and learning
                materials they need, and every registration gets a trackable Application ID.
              </p>
              <ul className="mt-6 grid gap-2.5">
                <TrustPill icon={<PalmTreeIcon className="h-6 w-6" />} text="The Electoral District of Mt. St. George/Goodwood only" />
                <TrustPill icon={<SchoolBookIcon className="h-6 w-6" />} text="Primary and secondary students" />
                <TrustPill icon={<PelicanIcon className="h-6 w-6" />} text="Free for every registered family" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Gallery strip — 3 photos, optimized ===== */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-title text-brand-900">Our Tobago</h2>
          <Link href="/bts/gallery" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Full gallery &rarr;
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <GalleryThumb src="/images/tobago/fort-george-sunset.jpg" alt="Sunset at Fort King George, Tobago" />
          <GalleryThumb src="/images/tobago/pigeon-point.jpg" alt="Pigeon Point beach, Tobago" />
          <GalleryThumb src="/images/tobago/tobago-rainforest.jpg" alt="Main Ridge Forest Reserve, Tobago" />
        </div>
      </section>

      {/* ===== Bottom CTA — short, decisive ===== */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready when you are</h2>
          <p className="mt-2 text-body text-brand-100">
            {EVENT_DATE.toLocaleDateString("en-TT", { month: "long", day: "numeric" })} closes registration.
          </p>
          <Link
            href="/bts/register"
            className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-white px-10 text-lg font-bold text-brand-800 shadow-lg hover:bg-brand-50 transition-colors"
          >
            Register a Student
          </Link>
          <p className="mt-4 text-xs text-brand-200">
            Already registered?{" "}
            <Link href="/bts/recover" className="underline font-semibold">
              Find your Application ID
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="snap-start shrink-0 w-[80vw] sm:w-auto rounded-card border border-brand-100 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {step}
      </div>
      <h3 className="mt-3 text-base font-bold text-brand-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 shadow-sm">
      <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-sm font-medium text-brand-800">{text}</span>
    </li>
  );
}

function GalleryThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 33vw, 300px"
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}
