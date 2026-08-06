import { NextResponse } from "next/server";

/** Simple health probe for Vercel / monitoring. */
export function GET() {
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}