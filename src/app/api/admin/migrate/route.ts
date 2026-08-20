import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { MIGRATIONS } from "@/lib/db-migrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Apply pending database migrations inside the Vercel runtime.
 *
 * The production DATABASE_URL is stored as a Vercel *sensitive* env var, so
 * its value can never be read back by the CLI or API — it only exists inside
 * the Vercel build/runtime. That means migrations cannot be applied from a
 * developer's laptop; they must run here.
 *
 * This route is admin-only, idempotent, and applies exactly the committed
 * migration files (embedded at build time in src/lib/db-migrations.ts). Each
 * statement is run individually and "already exists" errors are treated as a
 * no-op, so it is safe to call multiple times.
 *
 * Security: only an authenticated admin may trigger it. It never runs
 * arbitrary SQL — only the embedded, code-reviewed migrations.
 */

interface StatementResult {
  migration: string;
  statementIndex: number;
  status: "applied" | "skipped" | "error";
  preview: string;
  detail?: string;
}

type Sql = (query: string) => Promise<Record<string, unknown>[]>;

/** For seed statements, only run when the target table is empty. */
async function tableRowCount(sql: Sql, table: string): Promise<number> {
  const rows = await sql(`SELECT count(*)::int AS n FROM "${table}"`);
  return (rows[0]?.n as number | undefined) ?? 0;
}

export async function POST(): Promise<Response> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sql = neon(databaseUrl) as unknown as Sql;
  const results: StatementResult[] = [];

  for (const migration of MIGRATIONS) {
    const statements = migration.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.replace(/\s+/g, " ").slice(0, 90);

      // Idempotent seed guard: never double-insert reference rows.
      const insertMatch = /^INSERT\s+INTO\s+"?([a-z_]+)"?/i.exec(stmt);
      if (insertMatch) {
        try {
          const existing = await tableRowCount(sql, insertMatch[1]);
          if (existing > 0) {
            results.push({
              migration: migration.tag,
              statementIndex: i,
              status: "skipped",
              preview,
              detail: `seed already present (${existing} rows)`,
            });
            continue;
          }
        } catch (err) {
          results.push({
            migration: migration.tag,
            statementIndex: i,
            status: "error",
            preview,
            detail: `seed guard failed: ${err instanceof Error ? err.message : String(err)}`,
          });
          continue;
        }
      }

      try {
        await sql(stmt);
        results.push({
          migration: migration.tag,
          statementIndex: i,
          status: "applied",
          preview,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Idempotency: the object/column/constraint already exists → skip.
        if (/already exists/i.test(msg)) {
          results.push({
            migration: migration.tag,
            statementIndex: i,
            status: "skipped",
            preview,
            detail: "already exists",
          });
        } else {
          results.push({
            migration: migration.tag,
            statementIndex: i,
            status: "error",
            preview,
            detail: msg.slice(0, 300),
          });
        }
      }
    }
  }

  const errors = results.filter((r) => r.status === "error");
  return NextResponse.json({
    applied: results.filter((r) => r.status === "applied").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: errors.length,
    results,
  });
}
