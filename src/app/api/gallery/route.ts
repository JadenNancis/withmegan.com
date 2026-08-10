import { NextResponse } from "next/server";
import { readdir, unlink, mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/auth";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function galleryDir(site: string): string {
  return path.join(process.cwd(), "public", "images", "gallery", site);
}

function publicPrefix(site: string): string {
  return `/images/gallery/${site}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  try {
    const dir = galleryDir(site);
    let files: string[] = [];
    try {
      files = await readdir(dir);
    } catch {
      // Directory doesn't exist yet — no photos.
      return NextResponse.json({ photos: [] });
    }

    const photos = files
      .filter((f) => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
      .map((f) => `${publicPrefix(site)}/${f}`)
      .sort();

    return NextResponse.json({ photos });
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

  try {
    const dir = galleryDir(site);
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, opaqueName), bytes);
  } catch (err) {
    console.error("[gallery] write failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  return NextResponse.json({
    url: `${publicPrefix(site)}/${opaqueName}`,
    filename: opaqueName,
  });
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

  try {
    await unlink(path.join(galleryDir(site), filename));
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    console.error("[gallery] delete failed:", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}