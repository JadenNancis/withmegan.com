/**
 * Server-side unique THA ID generation.
 *
 * Format: BTS-{YYMMDD}-{6 random chars}  or  MD-{YYMMDD}-{6 random chars}
 * Generated server-side only — never trust a client-supplied ID.
 */

export function generateThaId(site: "bts" | "md", date = new Date()): string {
  const prefix = site === "bts" ? "BTS" : "MD";
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yy}${mm}${dd}-${rand}`;
}