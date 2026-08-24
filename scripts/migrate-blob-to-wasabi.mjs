#!/usr/bin/env node
/**
 * One-time migration: Vercel Blob -> Wasabi.
 *
 * Enumerates every object in Vercel Blob and copies it into the Wasabi
 * bucket, preserving the exact key (e.g. gallery/bts/..., documents/...).
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-blob-to-wasabi.mjs [--dry-run]
 *
 * With --dry-run, only lists what would be copied (no Wasabi credentials
 * needed) — useful for sizing the migration before applying it.
 *
 * Requires (in env):
 *   BLOB_READ_WRITE_TOKEN        — Vercel Blob token (read side)
 *   WASABI_ACCESS_KEY_ID / WASABI_SECRET_ACCESS_KEY / WASABI_BUCKET / WASABI_REGION
 *
 * Safe to re-run: uploads are idempotent (same key, overwrite).
 */
import { list } from "@vercel/blob";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const DRY_RUN = process.argv.includes("--dry-run");

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const WASABI_BUCKET = process.env.WASABI_BUCKET;
const WASABI_REGION = process.env.WASABI_REGION ?? "us-east-1";
const WASABI_ENDPOINT =
  process.env.WASABI_ENDPOINT ?? `https://s3.${WASABI_REGION}.wasabisys.com`;

if (!BLOB_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN. Nothing to read.");
  process.exit(1);
}
if (!DRY_RUN && (!WASABI_BUCKET || !process.env.WASABI_ACCESS_KEY_ID || !process.env.WASABI_SECRET_ACCESS_KEY)) {
  console.error("Missing WASABI_* credentials. Nothing to write. (Use --dry-run to list only.)");
  process.exit(1);
}

const s3 = DRY_RUN
  ? null
  : new S3Client({
      region: WASABI_REGION,
      endpoint: WASABI_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
      },
    });

async function main() {
  let cursor;
  let blobs = [];
  do {
    const page = await list({ cursor });
    blobs = blobs.concat(page.blobs);
    cursor = page.cursor;
  } while (cursor);

  console.log(`Found ${blobs.length} object(s) in Vercel Blob.`);
  if (blobs.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const totalBytes = blobs.reduce((sum, b) => sum + (b.size ?? 0), 0);
  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  const byPrefix = new Map();
  for (const b of blobs) {
    const prefix = (b.pathname ?? b.url).split("/")[0] ?? "(root)";
    const entry = byPrefix.get(prefix) ?? { count: 0, bytes: 0 };
    entry.count += 1;
    entry.bytes += b.size ?? 0;
    byPrefix.set(prefix, entry);
  }
  for (const [prefix, e] of byPrefix) {
    console.log(
      `  ${prefix.padEnd(16)} ${String(e.count).padStart(4)} object(s), ${(e.bytes / 1024 / 1024).toFixed(2)} MB`,
    );
  }

  if (DRY_RUN) {
    console.log("Dry run — nothing was copied. Re-run without --dry-run to migrate.");
    return;
  }

  let copied = 0;
  let failed = 0;
  for (const blob of blobs) {
    const key = blob.pathname;
    try {
      const res = await fetch(blob.url);
      if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
      const body = new Uint8Array(await res.arrayBuffer());

      await s3.send(
        new PutObjectCommand({
          Bucket: WASABI_BUCKET,
          Key: key,
          Body: body,
          ContentType: blob.contentType ?? "application/octet-stream",
        }),
      );
      copied += 1;
      if (copied % 25 === 0 || copied === blobs.length) {
        console.log(`  ${copied}/${blobs.length} copied`);
      }
    } catch (err) {
      failed += 1;
      console.error(`  FAILED ${key}:`, err?.message ?? err);
    }
  }

  console.log(`Done. Copied ${copied}, failed ${failed}.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
