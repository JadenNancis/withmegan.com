import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LEN = 32;
const COST = 16384; // N
const BLOCK_SIZE = 8; // r
const PARALLELISM = 1; // p

/**
 * Hash a password using Node's scrypt (no external dependency).
 * Returns a string in the format "scrypt:<saltHex>:<hashHex>".
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize(), salt, KEY_LEN, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify a password against a stored scrypt hash.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const hash = scryptSync(password.normalize(), salt, expected.length, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: 64 * 1024 * 1024,
  });
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}