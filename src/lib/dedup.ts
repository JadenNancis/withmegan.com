/**
 * Fuzzy duplicate detection for BTS and MD registrations.
 *
 * Matching strategy (in priority order):
 *   1. Exact phone match  — highest confidence (1.0).
 *   2. Fuzzy name + same community/address — Levenshtein ≤ 2.
 *   3. Fuzzy name only    — Levenshtein ≤ 2, lower confidence.
 *
 * Confidence scales with edit distance: 0 edits → 1.0, 2 edits → ~0.8.
 * Results are sorted by confidence, highest first.
 */

import { db } from "@/db/client";
import { btsGuardians, mdRegistrants } from "@/db/schema";
import { normalizeTtPhone } from "@/lib/tt-phone";

export interface DuplicateMatch {
  id: string;
  applicationId: string;
  fullName: string;
  community: string;
  confidence: number; // 0-1
  matchType: "phone" | "name+community" | "name";
}

/** Maximum Levenshtein edit distance to consider a near-match. */
const NAME_THRESHOLD = 2;

/**
 * Levenshtein edit distance between two strings.
 * Iterative DP, O(a.length * b.length) time, O(min) space.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Keep `prev` as the shorter row to minimize space.
  if (b.length < a.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let prev = new Array<number>(a.length + 1);
  let curr = new Array<number>(a.length + 1);
  for (let i = 0; i <= a.length; i++) prev[i] = i;

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,        // deletion
        curr[i - 1] + 1,    // insertion
        prev[i - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length];
}

/**
 * Normalize a name for fuzzy comparison:
 * lowercase, strip punctuation, collapse internal whitespace.
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Confidence from edit distance: 0 edits → 1.0, threshold edits → ~0.8. */
function confidenceFromDistance(distance: number): number {
  if (distance <= 0) return 1;
  // Linear falloff so distance=NAME_THRESHOLD still yields a useful signal.
  return Math.max(0, 1 - distance / (NAME_THRESHOLD + 2));
}

/**
 * Find potential duplicate registrations for the given site.
 *
 * Checks existing rows by exact phone first, then fuzzy name within the same
 * community, then fuzzy name alone. Returns up to 10 matches, best first.
 */
export async function findDuplicates(
  site: "bts" | "md",
  fullName: string,
  phone: string,
  community: string,
): Promise<DuplicateMatch[]> {
  const normalizedPhone = normalizeTtPhone(phone) ?? phone.trim();
  const normName = normalizeName(fullName);
  const normCommunity = normalizeName(community);
  const matches = new Map<string, DuplicateMatch>();

  const add = (m: DuplicateMatch) => {
    const existing = matches.get(m.id);
    // Keep the highest-confidence matchType for a given record.
    if (!existing || m.confidence > existing.confidence) {
      matches.set(m.id, m);
    }
  };

  if (site === "bts") {
    const rows = await db
      .select({
        id: btsGuardians.id,
        thaId: btsGuardians.thaId,
        fullName: btsGuardians.fullName,
        contactNumber: btsGuardians.contactNumber,
        community: btsGuardians.address,
      })
      .from(btsGuardians);

    for (const r of rows) {
      const rCommunity = normalizeName(r.community ?? "");

      // 1. Exact phone match.
      if (normalizedPhone && r.contactNumber === normalizedPhone) {
        add({
          id: r.id,
          applicationId: r.thaId ?? "",
          fullName: r.fullName,
          community: r.community ?? "",
          confidence: 1,
          matchType: "phone",
        });
        continue;
      }

      const dist = levenshtein(normName, normalizeName(r.fullName));
      if (dist > NAME_THRESHOLD) continue;

      // 2. Fuzzy name + same community.
      if (normCommunity && rCommunity && normCommunity === rCommunity) {
        add({
          id: r.id,
          applicationId: r.thaId ?? "",
          fullName: r.fullName,
          community: r.community ?? "",
          confidence: Math.max(confidenceFromDistance(dist), 0.9),
          matchType: "name+community",
        });
        continue;
      }

      // 3. Fuzzy name only.
      add({
        id: r.id,
        applicationId: r.thaId ?? "",
        fullName: r.fullName,
        community: r.community ?? "",
        confidence: confidenceFromDistance(dist),
        matchType: "name",
      });
    }
  } else {
    const rows = await db
      .select({
        id: mdRegistrants.id,
        thaId: mdRegistrants.thaId,
        fullName: mdRegistrants.fullName,
        phoneNumber: mdRegistrants.phoneNumber,
        community: mdRegistrants.address,
      })
      .from(mdRegistrants);

    for (const r of rows) {
      const rCommunity = normalizeName(r.community ?? "");

      if (normalizedPhone && r.phoneNumber === normalizedPhone) {
        add({
          id: r.id,
          applicationId: r.thaId ?? "",
          fullName: r.fullName,
          community: r.community ?? "",
          confidence: 1,
          matchType: "phone",
        });
        continue;
      }

      const dist = levenshtein(normName, normalizeName(r.fullName));
      if (dist > NAME_THRESHOLD) continue;

      if (normCommunity && rCommunity && normCommunity === rCommunity) {
        add({
          id: r.id,
          applicationId: r.thaId ?? "",
          fullName: r.fullName,
          community: r.community ?? "",
          confidence: Math.max(confidenceFromDistance(dist), 0.9),
          matchType: "name+community",
        });
        continue;
      }

      add({
        id: r.id,
        applicationId: r.thaId ?? "",
        fullName: r.fullName,
        community: r.community ?? "",
        confidence: confidenceFromDistance(dist),
        matchType: "name",
      });
    }
  }

  return [...matches.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}