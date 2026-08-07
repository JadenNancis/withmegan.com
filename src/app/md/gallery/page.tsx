import { SunsetWaveDivider, BasketIcon } from "@/components/md-illustrations";

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

export default async function MdGalleryPage() {
  const photos = await getPhotos("md");

  return (
    <div className="space-y-6">
      <SunsetWaveDivider className="w-full h-[20px] block opacity-60 -mt-2" />

      {/* Header */}
      <div className="md-animate-fade-in-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm">
          <BasketIcon className="h-9 w-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">Event Gallery</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Moments from the Market Day hamper distribution in the Electoral District of Mt. St. George/Goodwood.
        </p>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="md-animate-fade-in-up rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 p-12 text-center">
          <div className="mx-auto mb-4 opacity-30">
            <BasketIcon className="h-16 w-16" />
          </div>
          <p className="text-sm text-gray-500">
            No photos yet. Check back after the event!
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

      <SunsetWaveDivider className="w-full h-[20px] block opacity-60" />
    </div>
  );
}