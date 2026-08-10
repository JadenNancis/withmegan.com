import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const pathname = body?.payload?.pathname as string | undefined;
  if (!pathname || !pathname.startsWith("gallery/")) {
    return NextResponse.json({ error: "Invalid pathname." }, { status: 400 });
  }

  const site = pathname.split("/")[1];
  if (site !== "bts" && site !== "md") {
    return NextResponse.json({ error: "Invalid site." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (path: string) => {
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024,
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          tokenPayload: JSON.stringify({ site, path }),
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("[gallery/upload-token] failed:", err);
    return NextResponse.json({ error: "Could not generate upload token." }, { status: 500 });
  }
}