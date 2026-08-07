# Architecture

One deployment. One database. Two community programme portals served from different domains.

```
                    ┌─────────────────────────────────────┐
                    │        Vercel deployment            │
                    │     (single Next.js app)            │
                    │                                     │
   backtoschoolwithmegan.tha.tt ──┐                      │
                    │             ├─→ proxy (Host header) │
   marketdaywithmegan.tha.tt  ──┘     (src/proxy.ts)     │
                    │                   │                 │
                    │        ┌──────────┴──────────┐      │
                    │        │                     │      │
                    │   /bts/**              /md/**      │
                    │   Back to School      Market Day    │
                    │        │                     │      │
                    │        └──────────┬──────────┘      │
                    │          ┌────────┴────────┐        │
                    │          │  Neon Postgres   │        │
                    │          │  (single schema) │        │
                    │          └──────────────────┘        │
                    └─────────────────────────────────────┘
```

## Goals

- **One codebase, two brands.** Each domain shows its own name, colour, nav, and event details without forking the app.
- **Shared auth.** A single admin account works across both sites. No duplicate logins.
- **Shared data layer.** One Neon database. Site-specific tables are prefixed `bts_` or `md_`; auth, audit, and survey tables are shared.
- **Cheap to extend.** A third programme would be a new entry in the site registry, a new route prefix, and a new set of prefixed tables. No new deployment.

## Request lifecycle

1. **DNS:** Both `*.tha.tt` domains point at the same Vercel deployment via CNAME/A records.
2. **Proxy** (`src/proxy.ts`) inspects the `Host` header and calls `resolveSite()` from the site registry. (In Next.js 16, the former `middleware.ts` convention was renamed to `proxy.ts` and now runs on the Node.js runtime.)
3. **Rewrite:** The request path is rewritten to the site's internal prefix, `/bts` or `/md`. Shared paths (`/auth`, `/api`, `/_next`, static files) pass through untouched.
4. **Route handler:** The App Router serves the matching page under `src/app/bts/` or `src/app/md/`, wrapped in that site's layout (branding, nav, accent colour).
5. **Data:** Server components and route handlers read/write via the single Drizzle client (`src/db/client.ts`), using site-prefixed tables.

## Domain routing

### Production

| Domain | Resolves to | Internal prefix |
|--------|-------------|-----------------|
| `backtoschoolwithmegan.tha.tt` | `SITES.bts` | `/bts` |
| `marketdaywithmegan.tha.tt` | `SITES.md` | `/md` |

The matcher in `src/proxy.ts` skips `_next/static`, `_next/image`, and `favicon.ico` so static assets are never rewritten.

### Development

On `localhost:3000` the root path renders a small index page that lets you pick a site. Two overrides are available:

- **Query param:** `http://localhost:3000/?site=bts` or `?site=md`
- **Env hosts:** Set `NEXT_PUBLIC_BTS_HOST` / `NEXT_PUBLIC_MD_HOST` in `.env.local` (both default to `localhost:3000`)

Already-prefixed paths (`/bts/...`, `/md/...`) pass through unchanged in all environments, so you can navigate directly.

## Site registry

The single source of truth for site configuration is `src/sites/site-registry.ts`:

```ts
export const SITES: Record<SiteKey, SiteConfig> = {
  bts: { key: "bts", host: "backtoschoolwithmegan.tha.tt", routePrefix: "/bts", accent: "cyan", ... },
  md:  { key: "md",  host: "marketdaywithmegan.tha.tt",  routePrefix: "/md",  accent: "amber", ... },
};
```

Each `SiteConfig` carries the display name, tagline, event date, accent colour, route prefix, community registration goal, and nav items. The active config is provided to the React tree via `SiteProvider` / `useSite()` (`src/sites/site-context.tsx`).

**To add a third site:** add a `SiteKey`, a `SITES` entry, a route prefix folder under `src/app/`, and any prefixed tables. No other wiring required.

## Authentication

- **Auth.js v5** (NextAuth) with the Drizzle adapter, configured in `src/auth.ts`.
- **Database sessions** (not JWT). The `sessions` table holds active sessions.
- **Single realm:** one `users` table, one set of sessions. A user's `role` column (`"admin"` or `"staff"`) gates access to admin routes on **both** sites.
- **Sign-in page:** `/auth/signin` (shared, not site-prefixed).
- **Admin gate:** `requireAdmin()` (`src/lib/require-admin.ts`) is called at the top of any server component or route handler that needs elevation. It redirects unauthenticated / unauthorized users to sign-in.
- **Prototype credentials:** Credentials provider with a single seeded admin, overridable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars. Production should swap in an OAuth provider (Google, Azure AD). See `src/auth.ts`.
- **RBAC:** `src/lib/rbac.ts` provides role-check helpers for fine-grained permission checks.

## Database

Single Neon Postgres database, single schema, accessed via Drizzle ORM over the Neon serverless HTTP driver.

- **Shared tables:** `users`, `accounts`, `sessions`, `verification_tokens`, `audit_log`, `survey_responses`
- **BTS tables:** `bts_guardians`, `bts_dependents`, `bts_resource_assignments`, `bts_inventory`
- **MD tables:** `md_registrants`, `md_households`

Full table reference in [DATABASE.md](./DATABASE.md).

## Audit trail

`src/lib/audit.ts` exposes `logAudit()`, a fire-and-forget writer that records the actor, action, site, and target. It never blocks the mutation on audit failure (errors are logged to console only). Every state-changing admin operation on a sensitive resource should call it.

## Application ID generation

`src/lib/tha-id.ts` generates server-side unique IDs in the format `BTS-YYMMDD-XXXXXX` or `MD-YYMMDD-XXXXXX`. Client-supplied IDs are never trusted.

## Email & notifications

- **Email:** `src/lib/email.ts` sends transactional email via Resend. In dev (no `RESEND_API_KEY`), emails are logged to the console instead of sent.
- **Notification templates:** `src/lib/notification-templates.ts` and `src/lib/notifications.ts` render site-specific email bodies for registration confirmations and status updates.
- **Notify helper:** `src/lib/notify.ts` is the unified entry point called by route handlers after a mutation.

## QR codes

`src/lib/qr-code.ts` generates QR codes encoding the verification URL for each registration. Admins can scan these at the distribution counter to pull up the verify page. The `/api/qr` route serves the QR image.

## File uploads

`src/app/api/upload/route.ts` is a shared endpoint. Prototype uses local storage; production uses Vercel Blob (`BLOB_READ_WRITE_TOKEN`).

## Key files

| File | Responsibility |
|------|----------------|
| `src/proxy.ts` | Host-header routing, path rewriting (Next.js 16 proxy) |
| `src/sites/site-registry.ts` | Site definitions, `resolveSite()` |
| `src/sites/site-context.tsx` | React context for active site config |
| `src/auth.ts` | Auth.js config, providers, callbacks |
| `src/db/client.ts` | Neon + Drizzle client (singleton) |
| `src/db/schema.ts` | All table definitions and relations |
| `src/lib/require-admin.ts` | Admin authz gate |
| `src/lib/rbac.ts` | Role-based access control helpers |
| `src/lib/audit.ts` | Fire-and-forget audit logging |
| `src/lib/tha-id.ts` | Server-side unique ID generation |
| `src/lib/email.ts` | Transactional email (Resend) |
| `src/lib/notifications.ts` | Notification dispatch |
| `src/lib/qr-code.ts` | QR code generation |
| `src/components/site-shell.tsx` | Shared page shell (header, nav, footer) |