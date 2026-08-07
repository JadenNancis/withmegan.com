import Link from "next/link";
import { SITES } from "@/sites/site-registry";
import {
  TobagoBooksHero,
  PalmTreeIcon,
  PelicanIcon,
  SchoolBookIcon,
  WaveDivider,
  TobagoMapBadge,
} from "@/components/bts-illustrations";

const EVENT_DATE = new Date(SITES.bts.eventDate);

export default function BtsLanding() {
  return (
    <div className="space-y-0">
      {/* ===== Hero Section — full-bleed ===== */}
      <section className="-mx-4 -mt-8 mb-0 relative overflow-hidden">
        <div
          className="relative bg-cover bg-center min-h-[440px] sm:min-h-[540px]"
          style={{ backgroundImage: "url('/images/tobago/bts-child-reading.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-blue-900/85 to-cyan-700/75" />
          <div className="bts-ocean-shimmer absolute inset-0 opacity-15 pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="bts-float bts-float-delay-1 absolute left-[5%] top-[10%] opacity-20">
              <PalmTreeIcon className="h-16 w-16" />
            </div>
            <div className="bts-float bts-float-delay-3 absolute right-[8%] top-[15%] opacity-25">
              <PelicanIcon className="h-20 w-16" />
            </div>
            <div className="bts-float-sm bts-float-delay-2 absolute left-[15%] top-[55%] opacity-15">
              <SchoolBookIcon className="h-12 w-12" />
            </div>
          </div>

          <div className="relative mx-auto max-w-4xl px-4 py-12 sm:py-20">
            <div className="bts-fade-in-up bts-stagger-1 mx-auto mb-6 max-w-md sm:max-w-lg">
              <TobagoBooksHero className="w-full h-auto drop-shadow-2xl" />
            </div>

            <div className="bts-fade-in-up bts-stagger-2 text-center text-white">
              <span className="inline-block rounded-full bg-cyan-400/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-cyan-100 ring-1 ring-inset ring-cyan-300/40 backdrop-blur-sm">
                The Electoral District of Mt. St. George/Goodwood
              </span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
                Back to School with Megan
              </h1>
              <p className="mt-4 text-base sm:text-lg text-cyan-50 max-w-2xl mx-auto leading-relaxed">
                A community book drive ensuring every student in the Electoral District of Mt. St. George/Goodwood, Tobago
                starts the school year ready to learn. Register your dependents, upload their book lists,
                and we&rsquo;ll help match them with the resources they need.
              </p>
            </div>

            <div className="bts-fade-in-up bts-stagger-3 mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bts/register"
                className="bts-pulse-glow inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-cyan-800 shadow-lg hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95"
              >
                Register a Student &rarr;
              </Link>
              <div className="inline-flex items-center justify-center rounded-xl bg-cyan-600/30 px-6 py-4 text-base font-medium text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
                <span className="mr-2 text-lg">&#128197;</span>
                {EVENT_DATE.toLocaleDateString("en-TT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-2 h-16 overflow-hidden">
          <WaveDivider className="h-16 w-full" preserveAspectRatio="none" />
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="bts-fade-in-up bts-stagger-1 mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-900">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-cyan-700">
            Three simple steps to get your student ready for the new school year.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <StepPhotoCard
            step="1"
            title="Register"
            body="Submit your details and your dependents' information through our secure form."
            src="/images/tobago/bts-school-supplies.jpg"
            alt="School supplies and backpack"
          />
          <StepPhotoCard
            step="2"
            title="Upload Book Lists"
            body="Attach each student's book list (PDF or Word) so we know exactly what's needed."
            src="/images/tobago/bts-colorful-books.jpg"
            alt="Stack of colorful books"
          />
          <StepPhotoCard
            step="3"
            title="Collect Resources"
            body="Receive an Application ID and collect matched books and supplies at the distribution event."
            src="/images/tobago/bts-classroom.jpg"
            alt="Classroom with students"
          />
        </div>
      </section>

      {/* ===== Tobago Photo Gallery — full-bleed background ===== */}
      <section className="-mx-4 bg-gradient-to-b from-cyan-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bts-fade-in-up bts-stagger-1 mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-900">
              Tobago: Our Community
            </h2>
            <p className="mt-2 text-sm text-cyan-700">
              Serving the families of the Electoral District of Mt. St. George/Goodwood
            </p>
          </div>
          <div className="bts-fade-in-up bts-stagger-2 grid grid-cols-2 gap-3 sm:gap-4">
            <PhotoCard
              src="/images/tobago/bts-child-reading.jpg"
              alt="Child reading a book"
              span="col-span-2 sm:col-span-2"
            />
            <PhotoCard
              src="/images/tobago/fort-george-sunset.jpg"
              alt="Sunset at Fort King George, Tobago"
              span="col-span-1"
            />
            <PhotoCard
              src="/images/tobago/pigeon-point.jpg"
              alt="Pigeon Point beach, Tobago"
              span="col-span-1"
            />
            <PhotoCard
              src="/images/tobago/bts-classroom.jpg"
              alt="Classroom ready for learning"
              span="col-span-1"
            />
            <PhotoCard
              src="/images/tobago/tobago-rainforest.jpg"
              alt="Tobago rainforest — Main Ridge Forest Reserve"
              span="col-span-1"
            />
          </div>
        </div>
      </section>

      {/* ===== About the Initiative ===== */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="bts-fade-in-up bts-stagger-1 flex flex-col items-center text-center">
          <div className="mb-6 bts-float">
            <TobagoMapBadge className="h-24 w-24 drop-shadow-lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-900">
            About the Initiative
          </h2>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
            Back to School with Megan is a THA-supported community initiative serving families in
            the Electoral District of Mt. St. George/Goodwood, Tobago. Our goal is to reduce the financial burden of
            back-to-school season by connecting students with the books and learning materials they
            need to succeed. Every registration generates a unique Application ID you can use to track your
            request and collect your resources on event day.
          </p>
        </div>

        <div className="bts-fade-in-up bts-stagger-3 mt-8 grid gap-4 sm:grid-cols-3">
          <TrustIndicator
            icon={<PalmTreeIcon className="h-8 w-8" />}
            text="The Electoral District of Mt. St. George/Goodwood, Tobago"
          />
          <TrustIndicator
            icon={<SchoolBookIcon className="h-8 w-8" />}
            text="Primary · Secondary"
          />
          <TrustIndicator
            icon={<PelicanIcon className="h-8 w-8" />}
            text="Free for registered families"
          />
        </div>
      </section>

      {/* ===== Bottom CTA — full-bleed ===== */}
      <section className="-mx-4 relative overflow-hidden">
        <div
          className="relative bg-cover bg-center min-h-[280px] sm:min-h-[340px] flex items-center justify-center"
          style={{ backgroundImage: "url('/images/tobago/fort-george-sunset.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-blue-900/85 to-cyan-700/80" />
          <div className="bts-ocean-shimmer absolute inset-0 opacity-15 pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="bts-float bts-float-delay-1 absolute left-[10%] top-[20%] opacity-20">
              <SchoolBookIcon className="h-14 w-14" />
            </div>
            <div className="bts-float bts-float-delay-3 absolute right-[12%] top-[30%] opacity-20">
              <PalmTreeIcon className="h-16 w-16" />
            </div>
          </div>

          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center">
            <div className="bts-fade-in-up bts-stagger-1">
              <h2 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">
                Ready to Register?
              </h2>
              <p className="mt-3 text-base text-cyan-50">
                Join families across Tobago in preparing our students for success.
              </p>
            </div>
            <div className="bts-fade-in-up bts-stagger-2 mt-8">
              <Link
                href="/bts/register"
                className="bts-pulse-glow inline-flex items-center justify-center rounded-xl bg-white px-10 py-4 text-lg font-bold text-cyan-800 shadow-xl hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95"
              >
                Register a Student Now
              </Link>
              <p className="mt-4 text-xs text-cyan-100/80">
                Questions? Visit us at the community centre or ask on event day.
              </p>
            </div>
          </div>
        </div>

        <div className="-mt-2 h-16 overflow-hidden">
          <WaveDivider className="h-16 w-full" preserveAspectRatio="none" />
        </div>
      </section>
    </div>
  );
}

function PhotoCard({ src, alt, span }: { src: string; alt: string; span: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-md ${span}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 min-h-[160px] sm:min-h-[200px]"
        loading="lazy"
      />
    </div>
  );
}

function StepPhotoCard({
  step,
  title,
  body,
  src,
  alt,
}: {
  step: string;
  title: string;
  body: string;
  src: string;
  alt: string;
}) {
  return (
    <div className="bts-fade-in-up group relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-cyan-900/30 to-transparent" />
        <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-sm font-bold text-white shadow-md">
          {step}
        </div>
        <h3 className="absolute bottom-2 left-3 text-base font-bold text-white drop-shadow-lg">{title}</h3>
      </div>
      <div className="bg-white p-4">
        <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function TrustIndicator({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-sm">
      <div className="bts-icon-pulse flex-shrink-0">{icon}</div>
      <span className="text-sm font-medium text-cyan-800">{text}</span>
    </div>
  );
}