import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { getGalleryPhotos } from "@/lib/gallery-photos";
import { BtsGalleryManager as GalleryManager } from "./gallery-manager";

export const dynamic = "force-dynamic";

export default async function BtsAdminGalleryPage() {
  await requireAdmin("/bts/admin/gallery");
  const photos = await getGalleryPhotos("bts");
  return (
    <div className="space-y-6">
      <AdminNav current="/bts/admin/gallery" site="bts" />
      <GalleryManager initialPhotos={photos} />
    </div>
  );
}