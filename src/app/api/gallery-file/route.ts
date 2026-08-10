import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Serves files from the writable uploads/ directory in dev mode.
 * On Vercel, files are served from Vercel Blob CDN URLs directly, so this
 * route is only used when BLOB_READ_WRITE_TOKEN is not set.
 *
 * Query params:
 *  - site: "bts" | "md" (gallery) | "documents" (book-list uploads)
 *  - name: the opaque filename
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  const name = searchParams.get("name");

  if (!site || !name) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Validate site to prevent path traversal.
  if (!/^[a-zA-Z0-9_-]+$/.test(site)) {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  // Prevent path traversal in filename.
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  // Map site to subdirectory under uploads/.
  const subdir = site === "documents" ? "documents" : `gallery/${site}`;
  const filePath = path.join(UPLOAD_ROOT, subdir, name);

  try {
    const data = await readFile(filePath);
    const ext = name.split(".").pop()?.toLowerCase();
    const contentType = MIME[ext ?? ""] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}