import { NextResponse } from "next/server";
import { generateQrCodeDataUrl, getVerifyUrl } from "@/lib/qr-code";
import type { SiteKey } from "@/sites/site-registry";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const aid = url.searchParams.get("aid");
  const site = url.searchParams.get("site") as SiteKey | null;

  if (!aid || !site || (site !== "bts" && site !== "md")) {
    return NextResponse.json(
      { error: "Missing or invalid 'aid' or 'site' parameter" },
      { status: 400 },
    );
  }

  try {
    const verifyUrl = getVerifyUrl(site, aid);
    const dataUrl = await generateQrCodeDataUrl(verifyUrl);
    return NextResponse.json({ dataUrl, verifyUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}