import { BasketIcon } from "@/components/md-illustrations";
import { readdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function getPhotos(site: "bts" | "md"): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), "public", "images", "gallery", site);
    const files = await readdir(dir);
    return files
      .filter((f) => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
      .sort()
      .map((f) => `/images/gallery/${site}/${f}`);
  } catch {
    return [];
  }
}

export default async function MdGalleryPage() {
  const photos = await getPhotos("md");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="motion-safe:md-animate-fade-in-up flex flex-col items-center text-center px-6 py-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-inset ring-amber-400/40 backdrop-blur-sm shadow-lg">
          <BasketIcon className="h-9 w-9 text-amber-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Event Gallery</h1>
        <p className="mt-2 max-w-md text-sm text-amber-100/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          Moments from the Market Day hamper distribution in Mt. St. George/Goodwood.
        </p>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="motion-safe:md-animate-fade-in-up rounded-2xl border border-white/25 bg-amber-950/60 backdrop-blur-md p-8 sm:p-12 text-center shadow-xl">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-inset ring-amber-400/40">
            <BasketIcon className="h-10 w-10 text-amber-300" />
          </div>
          <h2 className="text-lg font-bold text-white">No photos yet</h2>
          <p className="mt-2 mx-auto max-w-xs text-sm text-amber-100/85 leading-relaxed">
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