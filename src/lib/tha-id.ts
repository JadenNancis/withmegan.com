/**
 * Server-side unique THA ID generation.
 *
 * Format: BTS-{YYMMDD}-{6 random chars}  or  MD-{YYMMDD}-{6 random chars}
 * Generated server-side only — never trust a client-supplied ID.
 *
 * Uses crypto.getRandomValues (CSPRNG) so IDs are unpredictable — important
 * because these IDs are used to verify identity at the distribution counter.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomSuffix(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateThaId(site: "bts" | "md", date = new Date()): string {
  const prefix = site === "bts" ? "BTS" : "MD";
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = randomSuffix(6);
  return `${prefix}-${yy}${mm}${dd}-${rand}`;
}