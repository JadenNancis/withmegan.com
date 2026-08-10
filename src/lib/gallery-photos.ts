import { readdir } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";

/**
 * Get gallery photo URLs for a given site.
 *
 * Production (Vercel Blob): lists blobs under `gallery/{site}/` and returns
 * their public CDN URLs.
 *
 * Dev fallback: reads from `public/images/gallery/{site}/` on disk.
 */
export async function getGalleryPhotos(site: string): Promise<string[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `gallery/${site}/` });
      return blobs
        .map((b) => b.url)
        .filter((url) => /\.(jpe?g|png|webp|gif)$/i.test(url))
        .sort();
    } catch (err) {
      console.error(`[gallery] blob list failed for ${site}:`, err);
      return [];
    }
  }

  try {
    const dir = path.join(process.cwd(), "public", "images", "gallery", site);
    const files = await readdir(dir);
    return files
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .map((f) => `/images/gallery/${site}/${f}`)
      .sort();
  } catch {
    return [];
  }
}