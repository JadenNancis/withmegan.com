import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { asRole } from "@/lib/rbac";

/**
 * GET /api/admin/users — list all users (admin only).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = asRole((session.user as { role?: string }).role);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error("[admin/users] query failed:", err);
    return NextResponse.json(
      { error: "Could not load users. The database may be waking up — try again in a moment." },
      { status: 500 },
    );
  }
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "revoke", "promote", "demote", "delete"]),
});

/**
 * PATCH /api/admin/users — approve, revoke, promote, or demote a user.
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = asRole((session.user as { role?: string }).role);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { id, action } = parsed.data;
  const selfId = (session.user as { id?: string }).id;

  // Don't allow self-revoke or self-delete.
  if (id === selfId && (action === "revoke" || action === "delete")) {
    return NextResponse.json({ error: "You cannot revoke or delete your own account." }, { status: 400 });
  }

  try {
    switch (action) {
      case "approve":
        await db.update(users).set({ status: "approved" }).where(eq(users.id, id));
        break;
      case "revoke":
        await db.update(users).set({ status: "revoked" }).where(eq(users.id, id));
        break;
      case "promote":
        await db.update(users).set({ role: "admin" }).where(eq(users.id, id));
        break;
      case "demote":
        await db.update(users).set({ role: "staff" }).where(eq(users.id, id));
        break;
      case "delete":
        await db.delete(users).where(eq(users.id, id));
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users] error:", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}