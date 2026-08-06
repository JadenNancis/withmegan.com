# Contributing

Thanks for working on withmegan.com — the dual-domain community initiative platform for Tobago.

## Setup

```bash
git clone <repo-url> withmegan.com
cd withmegan.com
pnpm install
cp .env.example .env.local     # then edit DATABASE_URL, AUTH_SECRET
pnpm db:push                   # sync schema to your Neon dev database
pnpm dev
```

Open `http://localhost:3000` and use `?site=bts` or `?site=md` to preview each portal.

## Branches & commits

- Work on a branch off `main` (e.g. `feat/bts-registration`, `fix/md-household-link`).
- Keep commits focused. Use imperative mood in the subject line: "Add guardian registration form", not "Added".
- Open a PR against `main`. Request a review before merging.

## Deployment flow

**Pushing to `main` triggers a production deployment** via the GitHub Actions workflow in `.github/workflows/deploy.yml` (Vercel deploy). There is no separate deployment per site — both domains are served from one Vercel project.

If the workflow's required secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) are not set, the workflow will skip and Vercel's native Git integration (if enabled on the imported repo) handles auto-deploy instead.

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the full deployment guide.

## Code standards

- **TypeScript strict.** No `any` without a stated reason in a comment.
- **Auth before mutation.** Admin routes call `requireAdmin()` at the top. Never trust client-supplied `userId`, `role`, or `orgId`.
- **Parameterized SQL only.** Use Drizzle's query builder — never string-interpolate SQL.
- **Server-side ID generation.** THA IDs come from `src/lib/tha-id.ts`; never accept them from the client.
- **Audit sensitive changes.** Call `logAudit()` from `src/lib/audit.ts` for state-changing admin operations.
- **No secrets in code.** `.env.local` is gitignored. Never commit real connection strings, tokens, or passwords. `.env.example` (placeholder values only) is safe to commit.

## Verification before PR

```bash
pnpm typecheck    # tsc --noEmit — must pass
pnpm lint         # next lint
pnpm build        # production build must succeed
```

If your change touches the database schema, run `pnpm db:generate` and commit the generated migration SQL for review.

## Project layout

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full architecture overview and [README.md](./README.md) for the project structure map.

## Adding a new site

1. Add a `SiteKey` and `SITES` entry in `src/sites/site-registry.ts`.
2. Create a route prefix folder under `src/app/` (e.g. `src/app/newsite/`) with a `layout.tsx` and `page.tsx`.
3. Add any site-prefixed tables to `src/db/schema.ts` (prefix with e.g. `newsite_`).
4. Run `pnpm db:generate` and commit the migration.

No new deployment, no new auth realm, no new database.