import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Wasabi (S3-compatible) object storage.
 *
 * Replaces Vercel Blob as the file backend. Wasabi is flat-rate storage
 * with no per-operation or egress charges, so the platform can hold
 * book-list documents and gallery photos indefinitely without hitting a
 * monthly capacity/bandwidth cap.
 *
 * Bucket must be public-read so objects are served straight from the
 * Wasabi endpoint (path-style URL: {endpoint}/{bucket}/{key}).
 *
 * Env vars (server-side only):
 *   WASABI_ACCESS_KEY_ID / WASABI_SECRET_ACCESS_KEY — Wasabi access keys
 *   WASABI_REGION          — e.g. us-east-1
 *   WASABI_BUCKET          — bucket name
 *   WASABI_ENDPOINT        — e.g. https://s3.us-east-1.wasabisys.com
 *
 * Dev fallback: when Wasabi is not configured, callers keep their local
 * `uploads/` behavior (see api/gallery-file).
 */

const REGION = process.env.WASABI_REGION ?? "us-east-1";
const BUCKET = process.env.WASABI_BUCKET ?? "";
const ENDPOINT =
  process.env.WASABI_ENDPOINT ?? `https://s3.${REGION}.wasabisys.com`;

export function isWasabiConfigured(): boolean {
  return !!(
    process.env.WASABI_BUCKET &&
    process.env.WASABI_ACCESS_KEY_ID &&
    process.env.WASABI_SECRET_ACCESS_KEY
  );
}

let client: S3Client | null = null;

function s3(): S3Client {
  if (!isWasabiConfigured()) {
    throw new Error("Wasabi storage is not configured.");
  }
  if (!client) {
    client = new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

/** Public, cacheable URL for an object (bucket must be public-read). */
export function publicUrl(key: string): string {
  if (!BUCKET) {
    throw new Error("WASABI_BUCKET is not set.");
  }
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

/**
 * Serving URL for gallery photos and book-list documents.
 *
 * The app proxies reads through /api/gallery-file (server-side, credential
 * authenticated) instead of pointing clients at the bucket directly. This
 * works whether or not the Wasabi account allows public object access and
 * keeps bucket keys opaque to browsers. If public-read is later enabled on
 * the bucket, these helpers can be switched back to `publicUrl` in one
 * place.
 */
export function galleryServingUrl(site: string, filename: string): string {
  return `/api/gallery-file?site=${site}&name=${encodeURIComponent(filename)}`;
}

export function documentServingUrl(filename: string): string {
  return `/api/gallery-file?site=documents&name=${encodeURIComponent(filename)}`;
}

/** Server-side upload. Returns the public URL. */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return publicUrl(key);
}

/** Server-side delete. Idempotent: deleting a missing key is a success. */
export async function deleteFile(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Presigned PUT URL for direct browser uploads (bypasses the serverless
 * function body limit). The client PUTs the file body; the URL expires
 * after `expiresIn` seconds.
 *
 * Content-Type is deliberately not part of the signature so a minor MIME
 * discrepancy between the browser and the key's extension cannot fail the
 * upload — the client's Content-Type is still stored on the object.
 */
export async function createUploadUrl(
  key: string,
  _contentType: string,
  expiresIn = 15 * 60,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3(), command, { expiresIn });
}

/** List objects under a prefix. Returns key, public URL, and size. */
export async function listFiles(
  prefix: string,
): Promise<{ key: string; url: string; size: number }[]> {
  const items: { key: string; url: string; size: number }[] = [];
  let token: string | undefined;
  do {
    const res = await s3().send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    for (const o of res.Contents ?? []) {
      if (o.Key) {
        items.push({ key: o.Key, url: publicUrl(o.Key), size: o.Size ?? 0 });
      }
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return items;
}

/** Fetch an object body (used by the proxy route). Returns a fresh ArrayBuffer. */
export async function downloadFile(key: string): Promise<ArrayBuffer> {
  const res = await s3().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const body = await res.Body?.transformToByteArray();
  if (!body) throw new Error(`Object ${key} has no body.`);
  const copy = new ArrayBuffer(body.byteLength);
  new Uint8Array(copy).set(body);
  return copy;
}
