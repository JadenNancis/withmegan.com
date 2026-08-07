import { SchoolBookIcon } from "@/components/bts-illustrations";

interface Photo {
  url: string;
}

async function getPhotos(site: string): Promise<string[]> {
  try {
    const base = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/gallery?site=${site}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: { photos?: string[] } = await res.json();
    return data.photos ?? [];
  } catch {
    return [];
  }
}

export default async function BtsGalleryPage() {
  const photos = await getPhotos("bts");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bts-fade-in-up text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">
          Event Gallery
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
          Moments from the Back to School book drive in Mt. St. George/Goodwood.
        </p>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="bts-fade-in-up rounded-2xl border border-dashed border-brand-200 bg-brand-50/30 p-16 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100/60 text-brand-400">
            <SchoolBookIcon className="h-9 w-9" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Photos arrive after the event — check back soon.
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