import { NextResponse } from "next/server";
import { readdir, unlink, mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/auth";
import { isWasabiConfigured, uploadFile, deleteFile } from "@/lib/storage";
import { getGalleryPhotos } from "@/lib/gallery-photos";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const USE_REMOTE = isWasabiConfigured();

/** Writable directory for dev-mode uploads (not under public/). */
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function siteDir(site: string): string {
  return path.join(UPLOAD_ROOT, "gallery", site);
}

function isSeedFile(site: string, filename: string): Promise<boolean> {
  try {
    const seedDir = path.join(process.cwd(), "public", "images", "gallery", site);
    return readdir(seedDir).then((files) => files.includes(filename)).catch(() => false);
  } catch {
    return Promise.resolve(false);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  try {
    const photos = await getGalleryPhotos(site);
    // Never cache the list: a deleted photo must be gone on the next read.
    return NextResponse.json(
      { photos },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (err) {
    console.error("[gallery] list failed:", err);
    return NextResponse.json({ error: "Could not list photos." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 8 MB." }, { status: 413 });
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WebP, or GIF." },
      { status: 415 },
    );
  }

  const opaqueName = `${crypto.randomUUID()}.${ext}`;
  const blobPath = `gallery/${site}/${opaqueName}`;

  try {
    if (USE_REMOTE) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const url = await uploadFile(blobPath, bytes, file.type || "application/octet-stream");
      return NextResponse.json({ url, filename: opaqueName });
    }

    // Dev fallback: write to uploads/gallery/{site}/ (writable at runtime).
    const dir = siteDir(site);
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, opaqueName), bytes);
    return NextResponse.json({
      url: `/api/gallery-file?site=${site}&name=${encodeURIComponent(opaqueName)}`,
      filename: opaqueName,
    });
  } catch (err) {
    console.error("[gallery] upload failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  const filename = searchParams.get("filename");

  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  // Seed images are bundled with the site and cannot be removed at runtime.
  if (await isSeedFile(site, filename)) {
    return NextResponse.json(
      { error: "This photo is bundled with the site and cannot be deleted." },
      { status: 400 },
    );
  }

  try {
    if (USE_REMOTE) {
      const key = `gallery/${site}/${filename}`;
      await deleteFile(key);
      return NextResponse.json({ success: true });
    }

    await unlink(path.join(siteDir(site), filename));
    return NextResponse.json({ success: true });
  } catch (err) {
    // Idempotent: deleting something already gone is a success — a stale
    // URL in a cached list must not block the client from clearing it.
    if ((err as any)?.code === "ENOENT" || (err as any)?.name === "NoSuchKey") {
      return NextResponse.json({ success: true });
    }
    console.error("[gallery] delete failed:", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
