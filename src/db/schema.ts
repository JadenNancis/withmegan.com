import { pgTable, pgEnum, text, timestamp, boolean, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Shared schema for the withmegan platform.
 *
 * One Neon database, one logical schema. Auth tables (Auth.js / Drizzle adapter)
 * are shared so a single admin account works across both sites. Site-specific
 * tables are prefixed with `bts_` or `md_` to keep their domains clear.
 */

// ── Auth (shared) ──────────────────────────────────────────────
// Auth.js v5 + @auth/drizzle-adapter expects these table names/shapes.

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  /** "admin" | "staff" — controls access to /admin routes on both sites. */
  role: text("role").notNull().default("staff"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ── Audit trail (shared) ───────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Who performed the action (user id or "anonymous" for public submissions). */
  actorId: text("actor_id").notNull(),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  /** "bts" | "md" — which site the action occurred on. */
  site: text("site").notNull(),
  /** Polymorphic target reference, e.g. "registration:abc-123". */
  target: text("target"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ── BTS: Book Drive ────────────────────────────────────────────

export const btsGuardians = pgTable("bts_guardians", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  consent: boolean("consent").notNull().default(false),
  /** Server-generated unique THA ID. */
  thaId: text("tha_id").unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const btsDependents = pgTable("bts_dependents", {
  id: uuid("id").primaryKey().defaultRandom(),
  guardianId: uuid("guardian_id")
    .notNull()
    .references(() => btsGuardians.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  schoolName: text("school_name").notNull(),
  gradeLevel: text("grade_level").notNull(),
  notes: text("notes"),
  /** Path/URL to the uploaded book list document. */
  bookListUrl: text("book_list_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const btsResourceAssignmentStatus = pgEnum("bts_assignment_status", [
  "pending",
  "partial",
  "full",
  "collected",
]);

export const btsResourceAssignments = pgTable("bts_resource_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  dependentId: uuid("dependent_id")
    .notNull()
    .references(() => btsDependents.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  quantityAssigned: integer("quantity_assigned").notNull().default(0),
  quantityCollected: integer("quantity_collected").notNull().default(0),
  status: btsResourceAssignmentStatus("status").notNull().default("pending"),
  assignedBy: text("assigned_by").references(() => users.id, { onDelete: "set null" }),
  /** Name of the person who physically collected the items (event-day confirmation). */
  collectedByName: text("collected_by_name"),
  collectedAt: timestamp("collected_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ── MD: Market Day ─────────────────────────────────────────────

export const mdRegistrants = pgTable("md_registrants", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  nationalId: text("national_id"),
  dateOfBirth: text("date_of_birth"),
  address: text("address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  productCategory: text("product_category"),
  consent: boolean("consent").notNull().default(false),
  thaId: text("tha_id").unique(),
  /** Assigned by admin; links to a household. */
  householdId: uuid("household_id").references(() => mdHouseholds.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const mdHamperStatus = pgEnum("md_hamper_status", [
  "unassigned",
  "assigned",
  "redeemed",
]);

export const mdHouseholds = pgTable("md_households", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Human-friendly reference, e.g. "HH-0042". */
  reference: text("reference").notNull().unique(),
  hamperStatus: mdHamperStatus("hamper_status").notNull().default("unassigned"),
  redeemedAt: timestamp("redeemed_at", { mode: "date" }),
  redeemedBy: text("redeemed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ── Relations ──────────────────────────────────────────────────

export const guardianRelations = relations(btsGuardians, ({ many }) => ({
  dependents: many(btsDependents),
}));

export const dependentRelations = relations(btsDependents, ({ one, many }) => ({
  guardian: one(btsGuardians, { fields: [btsDependents.guardianId], references: [btsGuardians.id] }),
  assignments: many(btsResourceAssignments),
}));

export const assignmentRelations = relations(btsResourceAssignments, ({ one }) => ({
  dependent: one(btsDependents, { fields: [btsResourceAssignments.dependentId], references: [btsDependents.id] }),
}));

export const registrantRelations = relations(mdRegistrants, ({ one }) => ({
  household: one(mdHouseholds, { fields: [mdRegistrants.householdId], references: [mdHouseholds.id] }),
}));

export const householdRelations = relations(mdHouseholds, ({ many }) => ({
  registrants: many(mdRegistrants),
}));

// ── Types ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type BtsGuardian = typeof btsGuardians.$inferSelect;
export type BtsDependent = typeof btsDependents.$inferSelect;
export type BtsResourceAssignment = typeof btsResourceAssignments.$inferSelect;
export type MdRegistrant = typeof mdRegistrants.$inferSelect;
export type MdHousehold = typeof mdHouseholds.$inferSelect;