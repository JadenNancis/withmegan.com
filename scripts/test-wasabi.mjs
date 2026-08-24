// Verify Wasabi connectivity: list, put a probe object, fetch it via the
// public URL (confirms public-read), then delete it.
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.WASABI_BUCKET;
const REGION = process.env.WASABI_REGION ?? "us-east-1";
const ENDPOINT =
  process.env.WASABI_ENDPOINT ?? `https://s3.${REGION}.wasabisys.com`;

if (!BUCKET || !process.env.WASABI_ACCESS_KEY_ID || !process.env.WASABI_SECRET_ACCESS_KEY) {
  console.error("Missing WASABI_* credentials.");
  process.exit(1);
}

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
});

const probe = `probe/${Date.now()}.txt`;

try {
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));
  console.log(
    `list: OK, ${listed.KeyCount ?? 0} object(s) in ${BUCKET}`,
  );

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: probe,
      Body: "wasabi-probe",
      ContentType: "text/plain",
    }),
  );
  console.log(`put: OK (${probe})`);

  const publicUrl = `${ENDPOINT}/${BUCKET}/${probe}`;
  const res = await fetch(publicUrl);
  const text = await res.text();
  console.log(`public fetch: HTTP ${res.status} body="${text}"`);
  if (res.status !== 200 || text !== "wasabi-probe") {
    console.error("Bucket is NOT public-read. Objects will not be viewable!");
  } else {
    console.log("Bucket IS public-read. Good.");
  }

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: probe }));
  console.log("cleanup: probe deleted");
} catch (err) {
  console.error("FAILED:", err.message ?? err);
  process.exit(1);
}
