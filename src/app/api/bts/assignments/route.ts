import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { btsResourceAssignments, btsResourceAssignmentStatus } from "@/db/schema";
import { logAudit } from "@/lib/audit";

const statusValues = ["pending", "partial", "full", "collected"] as const;

const createSchema = z.object({
  dependentId: z.string().uuid("Invalid dependent ID"),
  itemName: z.string().min(1, "Item name is required"),
  quantityAssigned: z.number().int().min(0).default(0),
  quantityCollected: z.number().int().min(0).default(0),
  status: z.enum(statusValues).default("pending"),
  collectedByName: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().uuid("Invalid assignment ID"),
  itemName: z.string().min(1).optional(),
  quantityAssigned: z.number().int().min(0).optional(),
  quantityCollected: z.number().int().min(0).optional(),
  status: z.enum(statusValues).optional(),
  collectedByName: z.string().nullable().optional(),
  collectedAt: z.string().datetime().nullable().optional(),
});

async function requireStaff() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "staff") return null;
  return session.user as { id: string; email: string | null; name: string | null; role: string };
}

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { dependentId, itemName, quantityAssigned, quantityCollected, status, collectedByName } = parsed.data;

  try {
    const [created] = await db
      .insert(btsResourceAssignments)
      .values({
        dependentId,
        itemName,
        quantityAssigned,
        quantityCollected,
        status,
        assignedBy: user.id,
        collectedByName: status === "collected" ? (collectedByName ?? null) : null,
        collectedAt: status === "collected" ? new Date() : null,
      })
      .returning({ id: btsResourceAssignments.id });

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "assignment.create",
      site: "bts",
      target: `assignment:${created.id}`,
      details: { dependentId, itemName, quantityAssigned, status, collectedByName },
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (err) {
    console.error("[bts/assignments] create failed:", err);
    return NextResponse.json({ error: "Assignment could not be created." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { id, itemName, quantityAssigned, quantityCollected, status, collectedByName, collectedAt } = parsed.data;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (itemName !== undefined) updates.itemName = itemName;
  if (quantityAssigned !== undefined) updates.quantityAssigned = quantityAssigned;
  if (quantityCollected !== undefined) updates.quantityCollected = quantityCollected;
  if (collectedByName !== undefined) updates.collectedByName = collectedByName;
  if (status !== undefined) {
    updates.status = status;
    updates.collectedAt =
      status === "collected" ? (collectedAt ? new Date(collectedAt) : new Date()) : null;
    if (status !== "collected") updates.collectedByName = null;
  } else if (collectedAt !== undefined) {
    updates.collectedAt = collectedAt ? new Date(collectedAt) : null;
  }

  try {
    const [updated] = await db
      .update(btsResourceAssignments)
      .set(updates)
      .where(and(eq(btsResourceAssignments.id, id)))
      .returning({ id: btsResourceAssignments.id });

    if (!updated) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "assignment.update",
      site: "bts",
      target: `assignment:${id}`,
      details: { updates },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bts/assignments] update failed:", err);
    return NextResponse.json({ error: "Assignment could not be updated." }, { status: 500 });
  }
}