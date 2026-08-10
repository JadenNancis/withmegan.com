import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { readdir } from "fs/promises";
import path from "path";
import { BtsGalleryManager as GalleryManager } from "./gallery-manager";

export const dynamic = "force-dynamic";

async function getPhotos(site: string): Promise<string[]> {
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

export default async function BtsAdminGalleryPage() {
  await requireAdmin("/bts/admin/gallery");
  const photos = await getPhotos("bts");
  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/gallery" site="bts" />
      <GalleryManager initialPhotos={photos} />
    </div>
  );
}