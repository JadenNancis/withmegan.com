import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { surveyResponses } from "@/db/schema";
import { auth } from "@/auth";

const submitSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  site: z.enum(["bts", "md"]),
  receivedNeeded: z.enum(["yes", "partially", "no"]),
  rating: z.number().int().min(1).max(5),
  comments: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { applicationId, site, receivedNeeded, rating, comments } = parsed.data;

  try {
    await db.insert(surveyResponses).values({
      applicationId,
      site,
      receivedNeeded,
      rating,
      comments: comments || null,
    });
  } catch (err) {
    console.error("[survey] insert failed:", err);
    return NextResponse.json(
      { error: "Survey could not be saved. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  if (site !== "bts" && site !== "md") {
    return NextResponse.json(
      { error: "Invalid site. Use ?site=bts or ?site=md." },
      { status: 400 },
    );
  }

  try {
    const rows = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.site, site));
    return NextResponse.json({ responses: rows });
  } catch (err) {
    console.error("[survey] fetch failed:", err);
    return NextResponse.json(
      { error: "Could not retrieve survey responses." },
      { status: 500 },
    );
  }
}