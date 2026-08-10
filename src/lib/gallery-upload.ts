import { upload } from "@vercel/blob/client";

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadGalleryPhoto(
  file: File,
  site: "bts" | "md",
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large. Max 8 MB.");
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    throw new Error("Unsupported file type. Use JPG, PNG, WebP, or GIF.");
  }

  const pathname = `gallery/${site}/${crypto.randomUUID()}.${ext}`;

  const hasBlobToken = !!process.env.NEXT_PUBLIC_HAS_BLOB_TOKEN;

  if (hasBlobToken) {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/gallery/upload-token",
    });
    return blob.url;
  }

  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/gallery?site=${site}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Upload failed.");
  }
  const { url } = await res.json();
  return url as string;
}