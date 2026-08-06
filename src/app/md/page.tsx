import Link from "next/link";
import { SITES } from "@/sites/site-registry";
import {
  TobagoHamperHero,
  BreadfruitIcon,
  MangoIcon,
  BasketIcon,
  CommunityIcon,
  SunsetWaveDivider,
  TobagoMapBadge,
  FloatingProduce,
} from "@/components/md-illustrations";

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
    <div className="space-y-0">
      {/* ──────── Hero Section ──────── */}
      {/* Tobago produce market photo — reflects food/hamper distribution purpose */}
      <section
        className="relative overflow-hidden rounded-2xl shadow-2xl bg-cover bg-center"
        style={{ backgroundImage: "url('/images/tobago/produce-market.jpg')" }}
      >
        {/* Warm amber gradient overlay for MD */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-700/80" />
        <div className="md-hero-shimmer absolute inset-0 opacity-20" />
        {/* Floating decorative produce */}
        <FloatingProduce className="absolute top-8 left-4 w-10 h-10 opacity-60 md-animate-float" />
        <FloatingProduce className="absolute top-16 right-6 w-8 h-8 opacity-50 md-animate-float-slow" />
        <FloatingProduce className="absolute bottom-12 left-8 w-6 h-6 opacity-40 md-animate-float" />

        <div className="relative grid items-center gap-6 px-6 py-10 sm:px-12 sm:py-16 lg:grid-cols-2">
          {/* Text column */}
          <div className="text-white space-y-4">
            <p className="text-amber-100 text-sm font-bold uppercase tracking-wider md-animate-fade-in-up">
              THA-Supported Community Initiative
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg md-animate-fade-in-up md-delay-1">
              {site.name}
            </h1>
            <p className="text-lg sm:text-xl text-amber-50 max-w-xl drop-shadow md-animate-fade-in-up md-delay-2">
              {site.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 md-animate-fade-in-up md-delay-3">
              <Link
                href="/md/register"
                className="md-animate-pulse-warm inline-flex justify-center rounded-xl bg-white px-7 py-3.5 text-base font-bold text-amber-700 shadow-lg hover:bg-amber-50 transition-all hover:scale-105 active:scale-95"
              >
                Register for a hamper
              </Link>
              <Link
                href="/md/admin"
                className="inline-flex justify-center rounded-xl border-2 border-white/50 px-7 py-3.5 text-base font-bold text-white hover:bg-white/15 transition-all hover:scale-105 active:scale-95"
              >
                Admin dashboard
              </Link>
            </div>
          </div>

          {/* Hero illustration column */}
          <div className="relative mx-auto max-w-sm lg:max-w-md md-animate-fade-in-up md-delay-4">
            <TobagoHamperHero className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ──────── Sunset Wave Divider ──────── */}
      <SunsetWaveDivider className="w-full h-[40px] block -mt-1" />

      {/* ──────── Stats Cards ──────── */}
      <section className="grid gap-4 sm:grid-cols-3 px-0 -mt-2">
        <div className="md-animate-fade-in-up rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 md-animate-glow">
          <p className="text-base sm:text-2xl font-bold text-amber-700 leading-snug">{formattedDate}</p>
          <p className="mt-1 text-sm font-medium text-amber-800">Event date</p>
        </div>
        <div className="md-animate-fade-in-up md-delay-1 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 md-animate-glow">
          <p className="text-2xl font-bold text-amber-700">2</p>
          <p className="mt-1 text-sm font-medium text-amber-800">Distribution centres</p>
        </div>
        <div className="md-animate-fade-in-up md-delay-2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 md-animate-glow">
          <p className="text-2xl font-bold text-amber-700">Free</p>
          <p className="mt-1 text-sm font-medium text-amber-800">For registered residents</p>
        </div>
      </section>

      {/* ──────── Tobago Food & Community Photo Gallery ──────── */}
      <section className="mt-4">
        <div className="mb-3 text-center">
          <h2 className="text-xl font-bold text-amber-800">Tobago: Food &amp; Community</h2>
          <p className="text-sm text-amber-600">Fresh produce, local markets, shared abundance</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <PhotoCard
            src="/images/tobago/tobago-cuisine.jpg"
            alt="Tobago cuisine — local food preparation"
            span="col-span-2 sm:col-span-2"
          />
          <PhotoCard
            src="/images/tobago/coconut-vendor.jpg"
            alt="Coconut vendor, Trinidad & Tobago"
            span="col-span-1"
          />
          <PhotoCard
            src="/images/tobago/scarborough-market.jpg"
            alt="Scarborough Market, Tobago"
            span="col-span-1"
          />
        </div>
      </section>

      {/* ──────── About / How It Works ──────── */}
      <section className="mt-4 rounded-2xl border border-amber-200 bg-white p-6 sm:p-8 md-animate-fade-in-up md-delay-3">
        <div className="flex items-center gap-4 mb-4">
          <TobagoMapBadge className="w-12 h-12 flex-none" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">About the initiative</h2>
            <p className="text-sm text-amber-700 font-medium">Rooted in Tobago, grown for community</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Market Day with Megan is a community hamper distribution initiative serving
          residents of Mount St. George and Goodwood, Tobago. Each eligible household
          receives a hamper of essential goods. Registration is open in advance &mdash;
          once registered, you&apos;ll be assigned to a household group for verification
          and collection on the day.
        </p>

        <h3 className="mt-6 text-sm font-bold text-gray-900 uppercase tracking-wide">How it works</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <BasketIcon className="w-10 h-10 mx-auto" />, step: "1", text: "Register online with your name, address, and contact details.", delay: "" },
            { icon: <MangoIcon className="w-10 h-10 mx-auto" />, step: "2", text: "Receive your unique THA ID and household reference.", delay: "md-delay-1" },
            { icon: <CommunityIcon className="w-12 h-10 mx-auto" />, step: "3", text: "Bring your ID on event day for verification at the distribution counter.", delay: "md-delay-2" },
            { icon: <BreadfruitIcon className="w-10 h-10 mx-auto" />, step: "4", text: "Collect your hamper &mdash; one per household.", delay: "md-delay-3" },
          ].map((item) => (
            <div
              key={item.step}
              className={`md-animate-fade-in-up ${item.delay} rounded-xl border border-amber-100 bg-gradient-to-b from-amber-50/50 to-white p-4 text-center hover:shadow-lg hover:border-amber-300 transition-all hover:-translate-y-1`}
            >
              <div className="mb-2">{item.icon}</div>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-sm">
                {item.step}
              </span>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── Bottom CTA ──────── */}
      {/* Tobago cuisine photo — food/community purpose */}
      <section
        className="relative overflow-hidden rounded-2xl shadow-xl bg-cover bg-center mt-4"
        style={{ backgroundImage: "url('/images/tobago/tobago-cuisine.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-700/80" />
        <div className="md-hero-shimmer absolute inset-0 opacity-15" />
        <FloatingProduce className="absolute top-4 left-6 w-8 h-8 opacity-50 md-animate-float" />
        <FloatingProduce className="absolute bottom-4 right-6 w-10 h-10 opacity-40 md-animate-float-slow" />
        <SunsetWaveDivider className="w-full h-[30px] block opacity-60" />
        <div className="px-6 py-10 text-center text-white">
          <p className="text-2xl font-bold drop-shadow-lg md-animate-fade-in-up">Ready to register?</p>
          <p className="mt-2 text-base text-amber-50 drop-shadow md-animate-fade-in-up md-delay-1">
            It takes less than five minutes to secure your hamper.
          </p>
          <Link
            href="/md/register"
            className="md-animate-pulse-warm mt-5 inline-flex rounded-xl bg-white px-8 py-3.5 text-lg font-bold text-amber-700 shadow-lg hover:bg-amber-50 transition-all hover:scale-105 active:scale-95 md-animate-fade-in-up md-delay-2"
          >
            Register now
          </Link>
        </div>
        <SunsetWaveDivider className="w-full h-[30px] block opacity-60 -scale-y-100" />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Photo Card — Tobago food & community photography                   */
/* ------------------------------------------------------------------ */
function PhotoCard({ src, alt, span }: { src: string; alt: string; span: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-md ${span}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}