import { readdir } from "fs/promises";
import path from "path";
import { isWasabiConfigured, listFiles, galleryServingUrl } from "@/lib/storage";

export type GalleryPhotoSource = "seed" | "upload";

export interface GalleryPhoto {
  url: string;
  /** Opaque filename in storage (delete calls use this, not the URL). */
  filename?: string;
  /** Seed photos are bundled with the site (public/) and cannot be removed at runtime. */
  deletable: boolean;
  source: GalleryPhotoSource;
}

/**
 * Get gallery photos for a given site.
 *
 * Production (Wasabi): lists objects under `gallery/{site}/` and returns
 * proxy URLs served through /api/gallery-file (objects are not public).
 * Also includes seed images from public/ that were committed to the repo.
 *
 * Dev fallback (no Wasabi config): reads seed images from
 * `public/images/gallery/{site}/` (committed to repo, served at build time)
 * PLUS uploaded images from `uploads/gallery/{site}/` (served by
 * the /api/gallery-file route).
 *
 * Items are tagged so the UI can show a delete affordance only for runtime
 * uploads. Seed photos are always re-listed on every request; they can only
 * be removed by editing the repo.
 */
export async function getGalleryPhotos(site: string): Promise<GalleryPhoto[]> {
  const photos: GalleryPhoto[] = [];

  // Always include seed images from public/ (committed to repo).
  try {
    const seedDir = path.join(process.cwd(), "public", "images", "gallery", site);
    const seedFiles = await readdir(seedDir);
    for (const f of seedFiles) {
      if (/\.(jpe?g|png|webp|gif|svg)$/i.test(f)) {
        photos.push({
          url: `/images/gallery/${site}/${f}`,
          deletable: false,
          source: "seed",
        });
      }
    }
  } catch {
    // No seed directory.
  }

  if (isWasabiConfigured()) {
    // Production: also list uploaded objects from Wasabi.
    try {
      const objects = await listFiles(`gallery/${site}/`);
      for (const o of objects) {
        if (/\.(jpe?g|png|webp|gif)$/i.test(o.key)) {
          const filename = o.key.split("/").pop() ?? o.key;
          photos.push({
            url: galleryServingUrl(site, filename),
            filename,
            deletable: true,
            source: "upload",
          });
        }
      }
    } catch (err) {
      console.error(`[gallery] wasabi list failed for ${site}:`, err);
    }
  } else {
    // Dev fallback: also read from uploads/gallery/{site}/.
    try {
      const uploadDir = path.join(process.cwd(), "uploads", "gallery", site);
      const uploaded = await readdir(uploadDir);
      for (const f of uploaded) {
        if (/\.(jpe?g|png|webp|gif)$/i.test(f)) {
          photos.push({
            url: galleryServingUrl(site, f),
            filename: f,
            deletable: true,
            source: "upload",
          });
        }
      }
    } catch {
      // No uploads yet.
    }
  }

  return photos.sort((a, b) => a.url.localeCompare(b.url));
}

/** URL-only convenience for display-only consumers (rotating gallery, public pages). */
export async function getGalleryPhotoUrls(site: string): Promise<string[]> {
  const photos = await getGalleryPhotos(site);
  return photos.map((p) => p.url);
}
