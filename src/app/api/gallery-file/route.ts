import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isWasabiConfigured, downloadFile } from "@/lib/storage";

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

/** Wasabi key prefixes by site (mirrors the dev uploads/ layout). */
const SITE_PREFIX: Record<string, string> = {
  documents: "documents",
  bts: "gallery/bts",
  md: "gallery/md",
};

/**
 * Serves files to the browser.
 *
 * Production: streams the object from Wasabi with server-side credentials
 * (objects are NOT public; this proxy is what makes them viewable).
 * Dev fallback: reads from the local uploads/ directory when WASABI_* is
 * unset.
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

  const ext = name.split(".").pop()?.toLowerCase();
  const contentType = MIME[ext ?? ""] ?? "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (isWasabiConfigured()) {
    const prefix = SITE_PREFIX[site];
    if (!prefix) {
      return NextResponse.json({ error: "Invalid site." }, { status: 400 });
    }
    try {
      const data = await downloadFile(`${prefix}/${name}`);
      return new NextResponse(data, { headers });
    } catch (err) {
      const status = (err as any)?.$metadata?.httpStatusCode;
      if (status === 404 || (err as any)?.name === "NoSuchKey") {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
      }
      console.error("[gallery-file] wasabi read failed:", err);
      return NextResponse.json({ error: "Could not read file." }, { status: 500 });
    }
  }

  // Dev fallback: read from uploads/.
  const subdir = site === "documents" ? "documents" : `gallery/${site}`;
  const filePath = path.join(UPLOAD_ROOT, subdir, name);

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, { headers });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}