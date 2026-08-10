import { readdir } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";

/**
 * Get gallery photo URLs for a given site.
 *
 * Production (Vercel Blob): lists blobs under `gallery/{site}/` and returns
 * their public CDN URLs. Also includes seed images from public/ that were
 * committed to the repo.
 *
 * Dev fallback (no BLOB_READ_WRITE_TOKEN): reads seed images from
 * `public/images/gallery/{site}/` (committed to repo, served at build time)
 * PLUS uploaded images from `uploads/gallery/{site}/` (served by
 * the /api/gallery-file route).
 */
export async function getGalleryPhotos(site: string): Promise<string[]> {
  const photos: string[] = [];

  // Always include seed images from public/ (committed to repo).
  try {
    const seedDir = path.join(process.cwd(), "public", "images", "gallery", site);
    const seedFiles = await readdir(seedDir);
    for (const f of seedFiles) {
      if (/\.(jpe?g|png|webp|gif|svg)$/i.test(f)) {
        photos.push(`/images/gallery/${site}/${f}`);
      }
    }
  } catch {
    // No seed directory.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Production: also list blobs from Vercel Blob.
    try {
      const { blobs } = await list({ prefix: `gallery/${site}/` });
      for (const b of blobs) {
        if (/\.(jpe?g|png|webp|gif)$/i.test(b.url)) {
          photos.push(b.url);
        }
      }
    } catch (err) {
      console.error(`[gallery] blob list failed for ${site}:`, err);
    }
  } else {
    // Dev fallback: also read from uploads/gallery/{site}/.
    try {
      const uploadDir = path.join(process.cwd(), "uploads", "gallery", site);
      const uploaded = await readdir(uploadDir);
      for (const f of uploaded) {
        if (/\.(jpe?g|png|webp|gif)$/i.test(f)) {
          photos.push(`/api/gallery-file?site=${site}&name=${encodeURIComponent(f)}`);
        }
      }
    } catch {
      // No uploads yet.
    }
  }

  return photos.sort();
}