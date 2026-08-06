# With Megan — Community Initiative Portals

One deployment, one database, two community initiative portals served from different domains.

## Sites

| Site | Domain | Event Date | Purpose |
|------|--------|------------|---------|
| Back to School with Megan | `backtoschoolwithmegan.tha.tt` | 30 Aug 2026 | Book drive: guardian registration, dependent book-list uploads, resource allocation & collection tracking |
| Market Day with Megan | `marketdaywithmegan.tha.tt` | 6 Sep 2026 | Hamper distribution: resident registration, household assignment, one-hamper-per-household verification |

## Architecture

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** Neon Postgres (serverless), Drizzle ORM
- **Auth:** Auth.js v5 (NextAuth), shared across both sites
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel (single deployment, both domains pointed at it)

### Domain routing

Middleware (`src/middleware.ts`) inspects the `Host` header and rewrites requests to the site's internal route prefix (`/bts` or `/md`). In development, use `?site=bts` or `?site=md` to switch sites on `localhost:3000`.

### Database

Single Neon database, single schema. Shared auth tables (`users`, `accounts`, `sessions`, `verification_tokens`, `audit_log`). Site-specific tables prefixed with `bts_` or `md_`.

## Getting started

```bash
# 1. Install deps
pnpm install

# 2. Set up env
cp .env.example .env.local
# Edit DATABASE_URL with your Neon connection string

# 3. Push schema to Neon
pnpm db:push

# 4. Run dev
pnpm dev
```

Open `http://localhost:3000` to see the dev index. Use `?site=bts` or `?site=md` to preview each site.

## Project structure

```
src/
├── app/
│   ├── bts/              # Back to School routes (domain: backtoschoolwithmegan.tha.tt)
│   ├── md/               # Market Day routes (domain: marketdaywithmegan.tha.tt)
│   ├── auth/             # Shared auth (sign-in page + route handler)
│   ├── api/              # Shared API routes (upload, health)
│   └── layout.tsx        # Root layout
├── components/           # Shared UI (SiteShell, form primitives)
├── db/                   # Drizzle schema + Neon client
├── lib/                  # Shared utilities (tha-id, audit, cn, require-admin)
├── sites/                # Site registry + context
├── auth.ts               # Auth.js config
└── middleware.ts         # Domain-based routing
```

## Status

🚧 Prototype in progress. See the project documents for full requirements.