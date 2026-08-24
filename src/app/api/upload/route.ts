import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isWasabiConfigured, uploadFile, documentServingUrl } from "@/lib/storage";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Shared file upload endpoint for book-list documents (BTS).
 *
 * Production: Wasabi (S3-compatible) — files survive redeployments and are
 * served from the bucket's public endpoint. Requires WASABI_* env vars.
 *
 * Dev fallback: when Wasabi is not configured, stores locally under
 * /uploads so the prototype works without external config.
 * The response shape ({ url }) is identical either way.
 *
 * Security gates:
 *  - MIME type AND extension validated.
 *  - File size capped.
 *  - Opaque filename (original name discarded).
 */

const ALLOWED = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (phone photos of book lists run large)

export async function POST(req: Request) {
  const session = await auth();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 413 });
  }

  const ext = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type. Use PDF, Word, or an image." }, { status: 415 });
  }

  const opaqueName = `${crypto.randomUUID()}.${ext}`;

  if (isWasabiConfigured()) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      await uploadFile(
        `documents/${opaqueName}`,
        bytes,
        file.type,
      );
      return NextResponse.json({
        url: documentServingUrl(opaqueName),
        filename: opaqueName,
        uploadedBy: session?.user?.email ?? "anonymous",
      });
    } catch (err) {
      console.error("[upload] Wasabi failed:", err);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  }

  const uploadDir = path.join(process.cwd(), "uploads", "documents");
  await mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, opaqueName), bytes);

  const url = `/api/gallery-file?site=documents&name=${encodeURIComponent(opaqueName)}`;

  return NextResponse.json({ url, filename: opaqueName, uploadedBy: session?.user?.email ?? "anonymous" });
}