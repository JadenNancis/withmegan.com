import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITES } from "@/sites/site-registry";
import { auth } from "@/auth";
import { getGalleryPhotoUrls } from "@/lib/gallery-photos";
import { RotatingGallery } from "@/components/rotating-gallery";
import {
  TobagoHamperHero,
  BreadfruitIcon,
  MangoIcon,
  BasketIcon,
  CommunityIcon,
  TobagoMapBadge,
  FloatingProduce,
} from "@/components/md-illustrations";

export const dynamic = "force-dynamic";

const FALLBACK_PHOTOS = [
  "/images/tobago/md-exotic-fruits.jpg",
  "/images/tobago/md-fresh-veg.jpg",
  "/images/tobago/scarborough-market.jpg",
  "/images/tobago/coconut-vendor.jpg",
];

export const metadata: Metadata = {
  title: "Market Day with Megan",
  description:
    "Free hampers of essential goods for families in Mt. St. George/Goodwood, Tobago. Register for a hamper today.",
  openGraph: {
    title: "Market Day with Megan",
    description:
      "Free hampers of essential goods for families in Mt. St. George/Goodwood, Tobago. Register for a hamper today.",
    type: "website",
    images: [
      {
        url: "/images/tobago/md-exotic-fruits.jpg",
        width: 1200,
        height: 630,
        alt: "Market Day with Megan, Tobago",
      },
    ],
  },
};

export default async function MdLanding() {
  const site = SITES.md;
  const galleryPhotos = await getGalleryPhotoUrls("md");
  const showcasePhotos = galleryPhotos.length > 0 ? galleryPhotos : FALLBACK_PHOTOS;
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "admin" || role === "staff";
  const eventDate = new Date(site.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-TT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-0">
      {/* ──────── Hero Section — full-bleed ──────── */}
      <section className="-mx-4 -my-5 sm:-my-8 mb-0 relative overflow-hidden bg-amber-950">
        <Image
          src="/images/tobago/md-exotic-fruits.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-700/80" />
        <div className="md-hero-shimmer absolute inset-0 opacity-20 pointer-events-none" />
        <FloatingProduce className="absolute top-8 left-4 w-10 h-10 opacity-60 motion-safe:md-animate-float" />
        <FloatingProduce className="absolute top-16 right-6 w-8 h-8 opacity-50 motion-safe:md-animate-float-slow" />
        <FloatingProduce className="absolute bottom-16 left-8 w-6 h-6 opacity-40 motion-safe:md-animate-float" />

          <div className="relative mx-auto max-w-4xl px-5 py-10 sm:py-20">
            <div className="text-center text-white space-y-4">
              <p className="text-amber-100 text-xs sm:text-sm font-bold uppercase tracking-wider drop-shadow-md motion-safe:md-animate-fade-in-up">
                THA-Supported Community Programme
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg motion-safe:md-animate-fade-in-up motion-safe:md-delay-1">
                {site.name}
              </h1>
              <p className="text-base sm:text-xl text-amber-50 max-w-2xl mx-auto drop-shadow-md motion-safe:md-animate-fade-in-up motion-safe:md-delay-2">
                {site.tagline}
              </p>
              <div className="flex flex-col gap-3 justify-center pt-2 sm:flex-row sm:items-center motion-safe:md-animate-fade-in-up motion-safe:md-delay-3">
                <Link
                  href="/md/register"
                  className="motion-safe:md-animate-pulse-warm inline-flex min-h-[56px] justify-center items-center rounded-xl bg-white px-7 py-3.5 text-base font-bold text-amber-700 shadow-lg active:scale-95 hover:bg-amber-50 transition-all"
                >
                  Register for a hamper &rarr;
                </Link>
                {isStaff && (
                <Link
                  href="/md/progress"
                  className="inline-flex min-h-[56px] justify-center items-center rounded-xl border-2 border-white/50 px-7 py-3.5 text-base font-bold text-white active:scale-95 hover:bg-white/15 transition-all"
                >
                  Community progress
                </Link>
                )}
              </div>
            </div>

            <div className="relative mx-auto max-w-sm pt-8 motion-safe:md-animate-fade-in-up motion-safe:md-delay-4 hidden sm:block">
              <TobagoHamperHero className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>

      </section>

      {/* ──────── Stats Cards ──────── */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
          <div className="card-hover motion-safe:md-animate-fade-in-up rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6 shadow-sm">
            <p className="text-sm sm:text-lg font-bold text-amber-900 leading-snug">{formattedDate}</p>
            <p className="mt-1 text-sm font-medium text-amber-600">Event date</p>
          </div>
          <div className="card-hover motion-safe:md-animate-fade-in-up motion-safe:md-delay-1 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6 shadow-sm">
            <p className="text-2xl font-bold text-amber-900">1</p>
            <p className="mt-1 text-sm font-medium text-amber-600">Distribution centre</p>
          </div>
          <div className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6 shadow-sm flex flex-col justify-center">
            <Link
              href="/md/register"
              className="motion-safe:md-animate-pulse-warm inline-flex min-h-[52px] justify-center items-center rounded-xl bg-amber-500 px-6 py-3 text-base font-bold text-white shadow-lg active:scale-95 hover:bg-amber-600 transition-all"
            >
              Register for a hamper &rarr;
            </Link>
          </div>
        </div>
      </section>

        {/* ──────── Rotating Tobago showcase — gallery photos cycle with Ken Burns.
              RotatingGallery polls /api/gallery so new uploads join live.
              Staff-only during launch phase. ──────── */}
        {isStaff && (
        <RotatingGallery
          initialImages={showcasePhotos}
          site="md"
          label="Tobago: Food & Community"
          galleryHref="/md/gallery"
        />
        )}

      {/* ──────── About / How It Works ──────── */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
        <div className="motion-safe:md-animate-fade-in-up motion-safe:md-delay-3">
          <div className="flex items-center gap-4 mb-4">
            <TobagoMapBadge className="w-12 h-12 flex-none" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">About the programme</h2>
              <p className="text-sm text-amber-100/90 font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Rooted in Tobago, grown for community</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-amber-50/85 leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
            Market Day with Megan is a community hamper distribution programme serving
            residents of Mt. St. George/Goodwood, Tobago. Each eligible household
            receives a hamper of essential goods. Registration is open in advance.
            Once registered, you&apos;ll be assigned to a household group for verification
            and collection on the day.
          </p>

          <h3 className="mt-8 text-sm font-bold text-white uppercase tracking-wide [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]">How it works</h3>
          {/* Mobile: snap-scrolling cards like BTS. sm+: grid. */}
          <div className="snap-row mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {[
              { icon: <BasketIcon className="w-10 h-10 mx-auto" />, step: "1", text: "Register online with your name, address, and contact details.", delay: "" },
              { icon: <MangoIcon className="w-10 h-10 mx-auto" />, step: "2", text: "Receive your unique Application ID and household reference.", delay: "motion-safe:md-delay-1" },
              { icon: <CommunityIcon className="w-12 h-10 mx-auto" />, step: "3", text: "Bring your ID on event day for verification at the distribution counter.", delay: "motion-safe:md-delay-2" },
              { icon: <BreadfruitIcon className="w-10 h-10 mx-auto" />, step: "4", text: "Collect your hamper. One per household.", delay: "motion-safe:md-delay-3" },
            ].map((item) => (
              <div
                key={item.step}
                className={`motion-safe:md-animate-fade-in-up ${item.delay} snap-start shrink-0 w-[78vw] sm:w-auto rounded-xl border border-white/25 bg-white/92 backdrop-blur-sm p-4 text-center shadow-md hover:shadow-xl hover:border-amber-300/60 transition-all active:scale-[0.98]`}
              >
                <div className="mb-2">{item.icon}</div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-sm">
                  {item.step}
                </span>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Bottom CTA — full-bleed ──────── */}
      <section className="-mx-4 relative overflow-hidden bg-amber-950">
        <Image
          src="/images/tobago/tobago-cuisine.jpg"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-700/80" />
        <div className="md-hero-shimmer absolute inset-0 opacity-15 pointer-events-none" />
        <FloatingProduce className="absolute top-4 left-6 w-8 h-8 opacity-50 motion-safe:md-animate-float" />
        <FloatingProduce className="absolute bottom-4 right-6 w-10 h-10 opacity-40 motion-safe:md-animate-float-slow" />

        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center text-white min-h-[260px] sm:min-h-[340px] flex flex-col items-center justify-center">
          <p className="text-2xl sm:text-4xl font-bold drop-shadow-lg motion-safe:md-animate-fade-in-up">Ready to register?</p>
          <p className="mt-3 text-base text-amber-50 drop-shadow motion-safe:md-animate-fade-in-up motion-safe:md-delay-1">
            It takes less than five minutes to secure your hamper.
          </p>
          <Link
            href="/md/register"
            className="motion-safe:md-animate-pulse-warm mt-6 inline-flex min-h-[56px] items-center rounded-xl bg-white px-8 py-3.5 text-lg font-bold text-amber-700 shadow-lg active:scale-95 hover:bg-amber-50 transition-all motion-safe:md-animate-fade-in-up motion-safe:md-delay-2"
          >
            Register now &rarr;
          </Link>
        </div>

      </section>
    </div>
  );
}
