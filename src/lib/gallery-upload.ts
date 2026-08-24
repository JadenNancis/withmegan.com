const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Remote (Wasabi) uploads are enabled when the public flag is set on the
// server (next.config env), i.e. when WASABI_* is configured in the
// deployment environment.
const REMOTE_UPLOADS = !!process.env.NEXT_PUBLIC_HAS_WASABI;

export interface UploadedPhoto {
  url: string;
  filename: string;
}

export async function uploadGalleryPhoto(
  file: File,
  site: "bts" | "md",
): Promise<UploadedPhoto> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large. Max 8 MB.");
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    throw new Error("Unsupported file type. Use JPG, PNG, WebP, or GIF.");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const pathname = `gallery/${site}/${filename}`;

  if (REMOTE_UPLOADS) {
    // Direct-to-Wasabi: get a presigned PUT URL, then upload the file body.
    const res = await fetch("/api/gallery/upload-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not start upload.");
    }
    const { url, publicUrl } = await res.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Upload failed. Please try again.");
    }
    return { url: publicUrl as string, filename };
  }

  // Dev fallback: POST through the server, which writes to uploads/.
  const formData = new FormData();
  formData.append("file", file);
  const postRes = await fetch(`/api/gallery?site=${site}`, {
    method: "POST",
    body: formData,
  });
  if (!postRes.ok) {
    const data = await postRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Upload failed.");
  }
  const { url } = await postRes.json();
  return { url: url as string, filename };
}
