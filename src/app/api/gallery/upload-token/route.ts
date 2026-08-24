import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUploadUrl, isWasabiConfigured, galleryServingUrl } from "@/lib/storage";

/**
 * Hands the browser a short-lived presigned PUT URL for a direct gallery
 * upload to Wasabi. Uploading straight from the client avoids the
 * serverless function body limit and keeps Wasabi as the only hop.
 *
 * Request:  { pathname: "gallery/bts/<uuid>.<ext>" }
 * Response: { url, key }
 *
 * When Wasabi is not configured (local dev), the client falls back to
 * POSTing the file to /api/gallery instead of calling this route.
 */
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isWasabiConfigured()) {
    return NextResponse.json(
      { error: "Remote storage is not configured." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const pathname = body?.pathname as string | undefined;
  if (!pathname || !pathname.startsWith("gallery/")) {
    return NextResponse.json({ error: "Invalid pathname." }, { status: 400 });
  }

  const site = pathname.split("/")[1];
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  const ext = pathname.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const contentType = contentTypes[ext ?? ""];
  if (!contentType) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WebP, or GIF." },
      { status: 400 },
    );
  }

  try {
    const url = await createUploadUrl(pathname, contentType);
    const filename = pathname.split("/").pop() ?? "";
    return NextResponse.json({
      url,
      key: pathname,
      publicUrl: galleryServingUrl(site, filename),
    });
  } catch (err) {
    console.error("[gallery/upload-token] failed:", err);
    return NextResponse.json(
      { error: "Could not generate upload URL." },
      { status: 500 },
    );
  }
}
