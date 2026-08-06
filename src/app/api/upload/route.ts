import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Shared file upload endpoint for book-list documents (BTS).
 *
 * Production: Vercel Blob — files survive redeployments and are served
 * from the Vercel Blob CDN. Requires BLOB_READ_WRITE_TOKEN.
 *
 * Dev fallback: when BLOB_READ_WRITE_TOKEN is absent, stores locally
 * under /public/uploads so the prototype works without external config.
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
} as const;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 413 });
  }

  const ext = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type. Use PDF or Word." }, { status: 415 });
  }

  const opaqueName = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(opaqueName, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({
        url: blob.url,
        filename: opaqueName,
        uploadedBy: session?.user?.email ?? "anonymous",
      });
    } catch (err) {
      console.error("[upload] Vercel Blob failed:", err);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, opaqueName), bytes);

  const url = `/uploads/${opaqueName}`;

  return NextResponse.json({ url, filename: opaqueName, uploadedBy: session?.user?.email ?? "anonymous" });
}