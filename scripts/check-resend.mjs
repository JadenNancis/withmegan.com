/* Validates the Resend API keys in .env.local and reports sending-domain status.
 * Read-only: only hits Resend's GET /domains (no emails are sent).
 * Secrets are read from the env file, never echoed. */
import { readFileSync } from "fs";
import { parse } from "dotenv";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = parse(raw);

const keys = [
  { site: "BTS", key: env.RESEND_API_KEY_BTS },
  { site: "MD", key: env.RESEND_API_KEY_MD },
];

for (const { site, key } of keys) {
  if (!key) {
    console.log(`${site}: no key set`);
    continue;
  }
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.log(`${site}: key rejected (HTTP ${res.status})`);
      continue;
    }
    const data = await res.json();
    const domains = data.data ?? [];
    console.log(`${site}: key valid, ${domains.length} domain(s)`);
    for (const d of domains) {
      console.log(`  - ${d.name}: status=${d.status}, region=${d.region ?? "n/a"}`);
    }
  } catch (err) {
    console.log(`${site}: network error - ${err.message}`);
  }
}
