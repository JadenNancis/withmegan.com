import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";
import { getGalleryPhotos } from "@/lib/gallery-photos";
import { MdGalleryManager as GalleryManager } from "./gallery-manager";

export const dynamic = "force-dynamic";

export default async function MdAdminGalleryPage() {
  await requireAdmin("/md/admin/gallery");
  const photos = await getGalleryPhotos("md");
  return (
    <div className="space-y-6">
      <AdminNav current="/md/admin/gallery" />
      <GalleryManager initialPhotos={photos} />
    </div>
  );
}