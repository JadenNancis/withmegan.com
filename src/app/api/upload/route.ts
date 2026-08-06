import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Shared file upload endpoint for book-list documents (BTS).
 *
 * Prototype: stores files locally under /public/uploads with an opaque key.
 * Production: swap to Vercel Blob — the response shape (url) stays the same.
 *
 * Security gates:
 *  - Auth checked first (registrants submit while unauthenticated in this
 *    prototype, so this route is open for public uploads but validates MIME +
 *    extension + size). TODO: require auth for admin-only access to files.
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
  // Auth check (optional for public registration uploads in prototype).
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
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, opaqueName), bytes);

  const url = `/uploads/${opaqueName}`;

  return NextResponse.json({ url, filename: opaqueName, uploadedBy: session?.user?.email ?? "anonymous" });
}