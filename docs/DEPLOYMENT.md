# Deployment

This app deploys as a **single Vercel project** that serves both domains. There is no separate deployment per site.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Neon](https://neon.tech) Postgres database
- Both domains registered and DNS-editable (`backtoschoolwithmegan.tha.tt`, `marketdaywithmegan.tha.tt`)
- The Vercel CLI (`pnpm add -g vercel`) for the first link, or import via the Vercel dashboard

## 1. Create the Vercel project

**Option A — Dashboard:** Import the GitHub repo at https://vercel.com/new. Framework preset is auto-detected as Next.js.

**Option B — CLI:**

```bash
pnpm add -g vercel
vercel link        # associate this directory with a Vercel project
vercel             # preview deployment
```

No build settings are needed — Vercel reads `package.json` (`next build`) automatically.

## 2. Add both domains

In the Vercel dashboard → **Settings → Domains**, add:

| Domain | Redirect | Notes |
|--------|----------|-------|
| `backtoschoolwithmegan.tha.tt` | — (primary) | BTS site |
| `marketdaywithmegan.tha.tt` | — (primary) | MD site |

Or via CLI:

```bash
vercel domains add backtoschoolwithmegan.tha.tt
vercel domains add marketdaywithmegan.tha.tt
```

Vercel will display the DNS records to add at your registrar (CNAME pointing to `cname.vercel-dns.com`, or A record to `76.76.21.21`). Add them at the `.tha.tt` DNS provider. Once DNS propagates, Vercel issues TLS certificates automatically.

> Both domains point at the **same** deployment. Proxy routes by Host header — see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 3. Set environment variables

In **Vercel → Settings → Environment Variables**, add these for the **Production** environment (and Preview if you want dev-against-prod-db, which is not recommended):

| Key | Value | Required |
|-----|-------|----------|
| `DATABASE_URL` | `postgres://...?sslmode=require` (Neon pooled connection string) | Yes |
| `AUTH_SECRET` | `openssl rand -base64 32` output | Yes |
| `AUTH_URL` | `https://backtoschoolwithmegan.tha.tt` (canonical production origin) | Yes |
| `NEXT_PUBLIC_BTS_HOST` | `backtoschoolwithmegan.tha.tt` | Yes |
| `NEXT_PUBLIC_MD_HOST` | `marketdaywithmegan.tha.tt` | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://backtoschoolwithmegan.tha.tt` (OpenGraph metadata base) | Yes |
| `RESEND_API_KEY_BTS` | BTS Resend API key (Back to School with Megan) | No |
| `RESEND_API_KEY_MD` | MD Resend API key (Market Day with Megan) | No |
| `RESEND_API_KEY` | Shared fallback Resend API key (used only when the site-specific key is missing) | No |
| `FROM_EMAIL_BTS` | `Back to School with Megan <noreply@btswithmegan.com>` | No |
| `FROM_EMAIL_MD` | `Market Day with Megan <noreply@mdwithmegan.com>` | No |
| `FROM_EMAIL` | Shared fallback from-address (used only when the site-specific one is missing) | No |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (only when file uploads go to Blob) | No |
| `ADMIN_EMAIL` | Override prototype admin email | No |
| `ADMIN_PASSWORD` | Override prototype admin password | No |

> **Never** commit `.env.local`. It is gitignored. Set secrets only in the Vercel dashboard or via `vercel env add`.

### `AUTH_URL` note

Auth.js uses `AUTH_URL` as the canonical trust host. Because both domains share one deployment, pick **one** as canonical (the BTS domain above). Auth callbacks resolve correctly because `/auth/*` is a shared path served on both domains.

## 4. Push the schema to Neon

Before the first deployment can serve requests, the database tables must exist.

```bash
# Locally, with DATABASE_URL set to your Neon production connection string
pnpm db:push
```

`db:push` uses Drizzle Kit to sync the schema in `src/db/schema.ts` to Neon without generating migration files. This is fine for the prototype. For production with tracked migrations, use:

```bash
pnpm db:generate   # create a migration in ./drizzle
pnpm db:migrate    # apply pending migrations
```

See [DATABASE.md](./DATABASE.md) for the full schema reference.

## 5. Deploy

If you imported via the dashboard, the first deploy runs automatically on push. Via CLI:

```bash
vercel --prod
```

## 6. Verify

- Visit `https://backtoschoolwithmegan.tha.tt` → should show the Back to School site (cyan accent).
- Visit `https://marketdaywithmegan.tha.tt` → should show the Market Day site (amber accent).
- Visit `https://backtoschoolwithmegan.tha.tt/auth/signin` → shared sign-in page.
- Sign in with the prototype admin, then hit `/bts/admin` or `/md/admin` to confirm the gate works.

## Automatic deployments

A GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers a Vercel production deployment on every push to `main`. This requires the `VERCEL_TOKEN` secret and `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` variables set in the GitHub repo settings — see the workflow file for details.

If you prefer Vercel's native Git integration instead, you can delete the workflow and let Vercel auto-deploy on push (the default for imported repos).