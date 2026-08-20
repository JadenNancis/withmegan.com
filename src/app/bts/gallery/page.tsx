import { SchoolBookIcon } from "@/components/bts-illustrations";
import { getGalleryPhotoUrls } from "@/lib/gallery-photos";
import { StaffOnlyBanner } from "@/components/staff-only-banner";

export const dynamic = "force-dynamic";

export default async function BtsGalleryPage() {
  const photos = await getGalleryPhotoUrls("bts");

  return (
    <div className="space-y-6">
      <StaffOnlyBanner />

      {/* Header */}
      <div className="motion-safe:bts-fade-in-up flex flex-col items-center text-center px-6 py-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-inset ring-brand-400/40 backdrop-blur-sm shadow-lg">
          <SchoolBookIcon className="h-9 w-9 text-brand-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Event Gallery</h1>
        <p className="mt-2 max-w-md text-sm text-brand-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Moments from the Back to School book drive in Mt. St. George/Goodwood.
        </p>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="motion-safe:bts-fade-in-up rounded-2xl border border-white/25 bg-brand-950/60 backdrop-blur-md p-8 sm:p-12 text-center shadow-xl">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-inset ring-brand-400/40">
            <SchoolBookIcon className="h-10 w-10 text-brand-300" />
          </div>
          <h2 className="text-lg font-bold text-white">No photos yet</h2>
          <p className="mt-2 mx-auto max-w-xs text-sm text-brand-100/85 leading-relaxed">
            Photos arrive after the event. Check back soon — or register now so you&rsquo;re in them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((url) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl"
            >
              <img
                src={url}
                alt="Event photo"
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
