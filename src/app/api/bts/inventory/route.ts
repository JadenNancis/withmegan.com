import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { btsInventory } from "@/db/schema";
import { logAudit } from "@/lib/audit";

const categoryValues = ["Books", "Stationery", "Uniforms", "Backpacks", "Other"] as const;

const createSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.enum(categoryValues).default("Other"),
  quantityReceived: z.number().int().min(0).default(0),
  condition: z.string().optional(),
  donorName: z.string().optional(),
  notes: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().uuid("Invalid inventory item ID"),
  itemName: z.string().min(1).optional(),
  category: z.enum(categoryValues).optional(),
  quantityReceived: z.number().int().min(0).optional(),
  condition: z.string().nullable().optional(),
  donorName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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

  const { itemName, category, quantityReceived, condition, donorName, notes } = parsed.data;

  try {
    const [created] = await db
      .insert(btsInventory)
      .values({
        itemName,
        category,
        quantityReceived,
        condition: condition || null,
        donorName: donorName || null,
        notes: notes || null,
        receivedBy: user.id,
      })
      .returning({ id: btsInventory.id });

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "inventory.create",
      site: "bts",
      target: `inventory:${created.id}`,
      details: { itemName, category, quantityReceived, donorName },
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (err) {
    console.error("[bts/inventory] create failed:", err);
    return NextResponse.json({ error: "Inventory item could not be created." }, { status: 500 });
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

  const { id, itemName, category, quantityReceived, condition, donorName, notes } = parsed.data;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (itemName !== undefined) updates.itemName = itemName;
  if (category !== undefined) updates.category = category;
  if (quantityReceived !== undefined) updates.quantityReceived = quantityReceived;
  if (condition !== undefined) updates.condition = condition;
  if (donorName !== undefined) updates.donorName = donorName;
  if (notes !== undefined) updates.notes = notes;

  try {
    const [updated] = await db
      .update(btsInventory)
      .set(updates)
      .where(eq(btsInventory.id, id))
      .returning({ id: btsInventory.id });

    if (!updated) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "inventory.update",
      site: "bts",
      target: `inventory:${id}`,
      details: { updates },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bts/inventory] update failed:", err);
    return NextResponse.json({ error: "Inventory item could not be updated." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const schema = z.object({ id: z.string().uuid("Invalid inventory item ID") });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const [deleted] = await db
      .delete(btsInventory)
      .where(eq(btsInventory.id, parsed.data.id))
      .returning({ id: btsInventory.id });

    if (!deleted) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }

    void logAudit({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      action: "inventory.delete",
      site: "bts",
      target: `inventory:${parsed.data.id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bts/inventory] delete failed:", err);
    return NextResponse.json({ error: "Inventory item could not be deleted." }, { status: 500 });
  }
}