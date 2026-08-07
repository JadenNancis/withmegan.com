import { db } from "@/db/client";
import { btsInventory, btsResourceAssignments } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export interface InventoryItem {
  id: string;
  itemName: string;
  category: "Books" | "Stationery" | "Uniforms" | "Backpacks" | "Other";
  quantityReceived: number;
  quantityAssigned: number;
  quantityAvailable: number;
  condition: string | null;
  donorName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllInventory(search?: string): Promise<InventoryItem[]> {
  const items = search
    ? await db
        .select()
        .from(btsInventory)
        .where(
          or(
            ilike(btsInventory.itemName, `%${search}%`),
            ilike(btsInventory.donorName, `%${search}%`),
            ilike(btsInventory.category, `%${search}%`),
          ),
        )
        .orderBy(desc(btsInventory.createdAt))
    : await db.select().from(btsInventory).orderBy(desc(btsInventory.createdAt));

  if (items.length === 0) return [];

  const assignments = await db.select().from(btsResourceAssignments);

  const assignedByName = new Map<string, number>();
  for (const a of assignments) {
    assignedByName.set(
      a.itemName,
      (assignedByName.get(a.itemName) ?? 0) + a.quantityAssigned,
    );
  }

  return items.map((item) => {
    const quantityAssigned = assignedByName.get(item.itemName) ?? 0;
    return {
      id: item.id,
      itemName: item.itemName,
      category: item.category,
      quantityReceived: item.quantityReceived,
      quantityAssigned,
      quantityAvailable: Math.max(0, item.quantityReceived - quantityAssigned),
      condition: item.condition,
      donorName: item.donorName,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

export interface InventorySummary {
  totalItems: number;
  totalReceived: number;
  totalAssigned: number;
  totalAvailable: number;
  byCategory: Array<{ category: string; received: number; assigned: number; available: number }>;
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const [items, assignments] = await Promise.all([
    db.select().from(btsInventory),
    db.select().from(btsResourceAssignments),
  ]);

  const assignedByName = new Map<string, number>();
  for (const a of assignments) {
    assignedByName.set(
      a.itemName,
      (assignedByName.get(a.itemName) ?? 0) + a.quantityAssigned,
    );
  }

  const totalReceived = items.reduce((sum, i) => sum + i.quantityReceived, 0);
  const totalAssigned = items.reduce(
    (sum, i) => sum + (assignedByName.get(i.itemName) ?? 0),
    0,
  );

  const catMap = new Map<string, { received: number; assigned: number }>();
  for (const item of items) {
    const cat = item.category;
    const existing = catMap.get(cat) ?? { received: 0, assigned: 0 };
    existing.received += item.quantityReceived;
    existing.assigned += assignedByName.get(item.itemName) ?? 0;
    catMap.set(cat, existing);
  }

  const byCategory = [...catMap.entries()]
    .map(([category, vals]) => ({
      category,
      received: vals.received,
      assigned: vals.assigned,
      available: Math.max(0, vals.received - vals.assigned),
    }))
    .sort((a, b) => b.received - a.received);

  return {
    totalItems: items.length,
    totalReceived,
    totalAssigned,
    totalAvailable: Math.max(0, totalReceived - totalAssigned),
    byCategory,
  };
}