/**
 * Trinidad & Tobago phone number formatting and validation.
 *
 * TT numbers are 7 digits with area code 868. The canonical display
 * format is (868) 123-4567. This module handles:
 *  - Stripping non-digits from raw input
 *  - Formatting for display as the user types
 *  - Validating that a number is a valid TT phone number
 *  - Normalizing to canonical format for storage
 */

/** Canonical format: (868) 123-4567 */
export function formatTtPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  const seven = digits.slice(-7);
  return `(868) ${seven.slice(0, 3)}-${seven.slice(3)}`;
}

/**
 * Validate a raw or formatted string as a valid TT phone number.
 * Accepts 7 digits, optionally prefixed with 868.
 */
export function isValidTtPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 7) return true;
  if (digits.length === 11 && digits.startsWith("1868")) return true;
  return false;
}

/**
 * Normalize any valid TT phone input to canonical storage format:
 * (868) 123-4567. Returns null for invalid input.
 */
export function normalizeTtPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  let seven: string;
  if (digits.length === 7) {
    seven = digits;
  } else if (digits.length === 11 && digits.startsWith("1868")) {
    seven = digits.slice(4);
  } else {
    return null;
  }
  return `(868) ${seven.slice(0, 3)}-${seven.slice(3)}`;
}