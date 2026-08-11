import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import { auth } from "@/auth";
import { SnapScrollRow } from "@/components/snap-scroll";
import { RotatingGallery } from "@/components/rotating-gallery";
import { getGalleryPhotos } from "@/lib/gallery-photos";

const site = SITES.bts;
const EVENT_DATE = new Date(site.eventDate + "T12:00:00");

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Back to School with Megan",
  description:
    "Free books and supplies for families in Mt. St. George/Goodwood, Tobago. Register in three minutes.",
  openGraph: {
    title: "Back to School with Megan",
    description:
      "Free books and supplies for families in Mt. St. George/Goodwood, Tobago. Register in three minutes.",
    type: "website",
    images: [
      {
        url: "/images/tobago/bts-child-reading.jpg",
        width: 1200,
        height: 630,
        alt: "Child reading, Back to School with Megan",
      },
    ],
  },
};

async function getRegistrationCount(): Promise<number> {
  try {
    const [row] = await db.select({ n: count() }).from(btsGuardians);
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

// Curated Tobago fallback set — keeps the strip gorgeous even pre-event
// when the gallery folder is still empty.
const FALLBACK_PHOTOS = [
  "/images/tobago/fort-george-sunset.jpg",
  "/images/tobago/pigeon-point.jpg",
  "/images/tobago/tobago-rainforest.jpg",
  "/images/tobago/tt-beach.jpg",
];

export default async function BtsLanding() {
  const registered = await getRegistrationCount();
  const galleryPhotos = await getGalleryPhotos("bts");
  const showcasePhotos = galleryPhotos.length > 0 ? galleryPhotos : FALLBACK_PHOTOS;
  const pct = Math.min(100, Math.round((registered / site.goalFamilies) * 100));
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "admin" || role === "staff";

  return (
    <div className="-mx-4 -my-5 sm:-my-8 space-y-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-brand-950/92" />

        <div className="relative mx-auto max-w-4xl px-5 py-12 sm:py-20 text-center text-white">
          <span className="motion-safe:bts-fade-in-up motion-safe:bts-stagger-1 inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-100 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            Mt. St. George/Goodwood, Tobago
          </span>
          <h1 className="motion-safe:bts-fade-in-up motion-safe:bts-stagger-2 mt-5 text-3xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
            Back to School with Megan
          </h1>
          <p className="motion-safe:bts-fade-in-up motion-safe:bts-stagger-3 mt-4 text-base sm:text-lg text-brand-100 max-w-xl mx-auto leading-relaxed drop-shadow-md">
            Free books and supplies for every student in the constituency.
            Register in three minutes. We&rsquo;ll match each child with what they need.
          </p>

          <div className="motion-safe:bts-fade-in-up motion-safe:bts-stagger-3 mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-brand-50 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
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

          <div className="motion-safe:bts-fade-in-up motion-safe:bts-stagger-4 mt-8 flex flex-col gap-3 justify-center sm:flex-row sm:items-center">
            <Link
              href="/bts/register"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-brand-800 shadow-lg active:scale-95 hover:bg-brand-50 transition-all"
            >
              Register a Student
            </Link>
            <Link
              href="/bts/recover"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-transparent px-8 text-base font-semibold text-white ring-2 ring-inset ring-white/40 active:scale-95 hover:bg-white/10 transition-all"
            >
              Find My Application ID
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Breather — photo shows between hero and progress teaser ===== */}
      <div className="h-10 sm:h-14" aria-hidden="true" />

      {/* ===== Live progress teaser (staff only) ===== */}
      {isStaff && (
      <section className="bg-white/95 backdrop-blur-sm border-y border-white/10 my-2">
        <Link
          href="/bts/progress"
          className="mx-auto max-w-4xl px-4 py-6 block group"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-brand-900">
              <span className="text-2xl font-bold">{registered}</span>
              <span className="text-brand-500"> / {site.goalFamilies} families registered</span>
            </p>
            <p className="text-sm font-bold text-brand-600 flex items-baseline gap-1">
              {pct}%
              <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
            </p>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${Math.max(3, pct)}%` }}
            />
          </div>
        </Link>
      </section>
      )}

      {/* ===== How it works — snap-scroll cards on mobile ===== */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="text-center">
          <h2 className="text-title text-white drop-shadow-md [text-shadow:0_3px_12px_rgba(0,0,0,0.55)]">Three steps, three minutes</h2>
          <p className="mt-1 text-sm sm:text-body text-brand-100 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            Everything happens right here on your phone.
          </p>
        </div>

        <SnapScrollRow
          count={3}
          scrollerClassName="snap-row mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible"
        >
          <StepCard
            step="1"
            title="Register"
            body="Your name, phone number, and community. That&rsquo;s all we need about you."
          />
          <StepCard
            step="2"
            title="Add your students"
            body="Each child's school and grade. Attach their book list if you have one, or skip it."
          />
          <StepCard
            step="3"
            title="Get your ID"
            body="We message you an Application ID with a QR code. Show it on event day to collect."
          />
        </SnapScrollRow>
      </section>

      {/* ===== Breather before About card ===== */}
      <div className="h-8 sm:h-10" aria-hidden="true" />

      {/* ===== About — the SVG hero lives here, away from the photo ===== */}
      <section className="bg-white/95 backdrop-blur-sm border-y border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
            <div className="motion-safe:bts-float order-first sm:order-last mx-auto max-w-xs sm:max-w-none">
              <TobagoBooksHero className="w-full h-auto drop-shadow-xl" />
            </div>
            <div>
              <h2 className="text-title text-brand-900">About the programme</h2>
              <p className="mt-3 text-body text-brand-800/90 leading-relaxed">
                Back to School with Megan is a THA-supported community programme serving
                Mt. St. George/Goodwood, Tobago. We connect students with the books and learning
                materials they need, and every registration gets a trackable Application ID.
              </p>
              <ul className="mt-6 grid gap-2.5">
                <TrustPill icon={<PalmTreeIcon className="h-6 w-6" />} text="Mt. St. George/Goodwood, Tobago" />
                <TrustPill icon={<SchoolBookIcon className="h-6 w-6" />} text="Primary and secondary students" />
                <TrustPill icon={<PelicanIcon className="h-6 w-6" />} text="Free for every registered family" />
              </ul>
            </div>
          </div>
        </div>
      </section>

        {/* ===== Rotating Tobago showcase — gallery photos cycle with Ken Burns.
              RotatingGallery polls /api/gallery so new uploads join live. ===== */}
        <RotatingGallery
          initialImages={showcasePhotos}
          site="bts"
          label="Our Tobago"
          galleryHref="/bts/gallery"
        />

      {/* ===== Breather before bottom CTA ===== */}
      <div className="h-8 sm:h-10" aria-hidden="true" />

      {/* ===== Bottom CTA — short, decisive ===== */}
      <section className="bg-gradient-to-br from-brand-900/92 to-brand-950/95 backdrop-blur-md text-white border-t border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-md">Ready when you are</h2>
          <p className="mt-2 text-body text-brand-100 drop-shadow-sm">
            {EVENT_DATE.toLocaleDateString("en-TT", { month: "long", day: "numeric" })} closes registration.
          </p>
          <Link
            href="/bts/register"
            className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-white px-10 text-lg font-bold text-brand-800 shadow-lg active:scale-95 hover:bg-brand-50 transition-all"
          >
            Register a Student
          </Link>
          <p className="mt-4 text-xs text-brand-200 drop-shadow-sm">
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
    <div className="card-hover snap-start shrink-0 w-[78vw] sm:w-auto rounded-2xl border border-brand-100/60 bg-white/95 backdrop-blur-sm p-5 shadow-lg hover:border-brand-300 active:scale-[0.98]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white shadow-md">
        {step}
      </div>
      <h3 className="mt-3 text-base font-bold text-brand-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="card-hover flex items-center gap-3 rounded-xl border border-brand-200 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-md hover:border-brand-300">
      <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-sm font-medium text-brand-800">{text}</span>
    </li>
  );
}
