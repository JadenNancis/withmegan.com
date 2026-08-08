import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

/**
 * POST /api/auth/signup
 *
 * Creates a new user account with status "pending".
 * The administrator must approve the account before it can sign in.
 * No email verification is sent (email transport not yet configured).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json({ error: firstError?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check for existing account.
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      // Don't reveal whether the email exists. Same message either way.
      return NextResponse.json(
        { error: "An account with this email already exists. If you are waiting for approval, contact the administrator." },
        { status: 409 },
      );
    }

    const passwordHash = hashPassword(password);

    await db.insert(users).values({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "staff",
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      message: "Account created. An administrator must approve it before you can sign in.",
    });
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}