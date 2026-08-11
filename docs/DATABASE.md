# Database

Single Neon Postgres database, single schema, accessed via Drizzle ORM over the Neon serverless HTTP driver.

- **Client:** `src/db/client.ts` — exports `db` (Drizzle instance) and `Database` type.
- **Schema:** `src/db/schema.ts` — all table definitions, enums, relations, and derived types.
- **Config:** `drizzle.config.ts` — Drizzle Kit config (dialect `postgresql`, migrations output to `./drizzle`).

## Connection

The connection string lives in `DATABASE_URL` (`.env.local` for dev, Vercel env vars for production). The Neon serverless driver uses HTTP, so connections are lazy and reused across hot requests — no pooling config needed beyond using Neon's pooled endpoint.

```
DATABASE_URL=postgres://user:password@ep-xxx-pooler.region.aws.neon.tech/withmegan?sslmode=require
```

Always use the **pooled** Neon endpoint (the `-pooler` hostname) for app traffic.

## Tables

### Shared — Auth (Auth.js / Drizzle adapter)

| Table | Purpose |
|-------|---------|
| `users` | Core user record. `id` (text UUID), `name`, `email` (unique), `emailVerified`, `image`, `role` (`"admin"` \| `"staff"`, default `"staff"`). |
| `accounts` | OAuth / Credentials provider linkage. References `users.id` (cascade delete). |
| `sessions` | Database sessions. `sessionToken` (PK), `userId` → `users.id`, `expires`. |
| `verification_tokens` | Email verification tokens. `identifier`, `token`, `expires`. |

### Shared — Audit & Surveys

| Table | Purpose |
|-------|---------|
| `audit_log` | Fire-and-forget audit trail. `actorId`, `actorEmail`, `action`, `site` (`"bts"` \| `"md"`), `target` (polymorphic ref), `details` (jsonb), `createdAt`. Written by `src/lib/audit.ts`. |
| `survey_responses` | Post-event survey submissions. `applicationId` (links to registration), `site` (`"bts"` \| `"md"`), `receivedNeeded` (text), `rating` (integer), `comments`, `createdAt`. |

### BTS — Back to School Book Drive

| Table | Purpose |
|-------|---------|
| `bts_guardians` | Guardian registrations. `fullName`, `contactNumber`, `email`, `address`, `consent`, `thaId` (unique server-generated). |
| `bts_dependents` | Children/Students linked to a guardian. `guardianId` → `bts_guardians.id` (cascade), `studentName`, `schoolName`, `gradeLevel`, `notes`, `bookListUrl`. |
| `bts_resource_assignments` | Per-dependent book/resource assignments. `dependentId` → `bts_dependents.id` (cascade), `itemName`, `quantityAssigned`, `quantityCollected`, `status` (enum: `pending` \| `partial` \| `full` \| `collected`), `assignedBy` → `users.id` (set null), `collectedByName`, `collectedAt`. |
| `bts_inventory` | Donated inventory stock. `itemName`, `category` (enum: `Books` \| `Stationery` \| `Uniforms` \| `Backpacks` \| `Other`), `quantityReceived`, `condition`, `donorName`, `receivedBy` → `users.id` (set null), `notes`. |

### MD — Market Day Hamper Distribution

| Table | Purpose |
|-------|---------|
| `md_registrants` | Resident registrations. `fullName`, `nationalId`, `dateOfBirth`, `address`, `phoneNumber`, `email`, `productCategory`, `consent`, `thaId` (unique), `householdId` → `md_households.id` (set null). |
| `md_households` | Household grouping for one-hamper-per-household enforcement. `reference` (unique, e.g. `HH-0042`), `hamperStatus` (enum: `unassigned` \| `assigned` \| `redeemed`), `redeemedAt`, `redeemedBy` → `users.id` (set null). |

## Enums

| Enum | Values |
|------|--------|
| `bts_assignment_status` | `pending`, `partial`, `full`, `collected` |
| `bts_inventory_category` | `Books`, `Stationery`, `Uniforms`, `Backpacks`, `Other` |
| `md_hamper_status` | `unassigned`, `assigned`, `redeemed` |

## Relations

Drizzle relations are defined for typed queries:

- `bts_guardians` 1—many `bts_dependents`
- `bts_dependents` 1—many `bts_resource_assignments`
- `md_registrants` many—1 `md_households`
- `md_households` 1—many `md_registrants`

## Migrations

### Prototype (schema sync, no migration files)

```bash
pnpm db:push
```

Pushes the current `src/db/schema.ts` directly to Neon. Fast iteration, no migration history. Fine while the schema is still in flux.

### Production (tracked migrations)

```bash
pnpm db:generate   # generate a SQL migration in ./drizzle from schema changes
pnpm db:migrate    # apply pending migrations to the target database
```

Migration files live in `./drizzle/` (gitignored meta directory, but the generated SQL files should be committed for review). Always review generated SQL before migrating production.

### Studio

```bash
pnpm db:studio
```

Opens Drizzle Studio — a browser UI for browsing and editing table data. Useful for seeding the prototype admin or inspecting registrations.

## Derived types

The schema exports inferred types for use in application code:

```ts
export type User = typeof users.$inferSelect;
export type BtsGuardian = typeof btsGuardians.$inferSelect;
export type BtsDependent = typeof btsDependents.$inferSelect;
export type BtsResourceAssignment = typeof btsResourceAssignments.$inferSelect;
export type BtsInventoryItem = typeof btsInventory.$inferSelect;
export type MdRegistrant = typeof mdRegistrants.$inferSelect;
export type MdHousehold = typeof mdHouseholds.$inferSelect;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
```

## Hard rules

- **Parameterized queries only.** Drizzle interpolates safely; never build SQL by hand with string concatenation.
- **Server-side ID generation.** `thaId` is generated by `src/lib/tha-id.ts` — never trust a client-supplied ID.
- **Auth before mutation.** Every write path must go through `requireAdmin()` (admin routes) or otherwise verify the session server-side.