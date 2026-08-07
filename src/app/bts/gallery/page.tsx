import Image from "next/image";
import { SchoolBookIcon } from "@/components/bts-illustrations";

interface GalleryPhoto {
  url: string;
  alt: string;
}

async function getPhotos(site: string): Promise<{ photos: GalleryPhoto[]; error: boolean }> {
  try {
    const base = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/gallery?site=${site}`, {
      cache: "no-store",
    });
    if (!res.ok) return { photos: [], error: true };
    const data = (await res.json()) as { photos?: string[] };
    const photos = (data.photos ?? []).map((url) => ({
      url,
      // Derive a readable alt from the opaque filename — admins upload
      // via the gallery manager, which names uploads by UUID. Best-effort.
      alt: `Event photo from ${site === "bts" ? "Back to School" : "Market Day"} with Megan`,
    }));
    return { photos, error: false };
  } catch {
    return { photos: [], error: true };
  }
}

export default async function BtsGalleryPage() {
  const { photos, error } = await getPhotos("bts");

  return (
    <div className="space-y-6">
      <header className="bts-fade-in-up flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 shadow-sm">
          <SchoolBookIcon className="h-9 w-9" />
        </div>
        <h1 className="text-title text-brand-900">Event Gallery</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Moments from the Back to School book drive in Mount St. George &amp; Goodwood.
        </p>
      </header>

      {error ? (
        <div className="rounded-card border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
          Photos couldn&rsquo;t load right now. Check back shortly.
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-card border border-dashed border-brand-300 bg-brand-50/40 p-12 text-center">
          <div className="mx-auto mb-4 w-fit opacity-40">
            <SchoolBookIcon className="h-16 w-16" />
          </div>
          <p className="text-sm text-gray-500">
            No photos yet. Check back after the event!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {photos.map((p) => (
            <div
              key={p.url}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-sm"
            >
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
