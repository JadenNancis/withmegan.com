/**
 * Trinidad & Tobago phone number formatting and validation.
 *
 * TT numbers are 7 digits with area code 868. The canonical display
 * format is (868) 123-4567. This module handles:
 *  - Stripping non-digits and area-code prefixes from raw input
 *  - Formatting for display as the user types (no premature area code)
 *  - Validating that a number is a valid TT phone number
 *  - Normalizing to canonical format for storage
 */

/**
 * Format raw input for display as the user types.
 * Strips any 868/1868 prefix the user may have typed, then formats
 * just the 7 local digits. Shows "(868) xxx-xxxx" only when all 7
 * digits are present — never injects 8s into partial input.
 */
export function formatTtPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";

  // Strip common prefixes the user might type
  let local = digits;
  if (local.startsWith("1868") && local.length > 7) {
    local = local.slice(4);
  } else if (local.startsWith("868") && local.length > 7) {
    local = local.slice(3);
  }

  // Keep at most 7 local digits
  local = local.slice(0, 7);

  if (local.length === 0) return "";
  if (local.length <= 3) return local;
  if (local.length <= 6) return `${local.slice(0, 3)}-${local.slice(3)}`;
  return `(868) ${local.slice(0, 3)}-${local.slice(3)}`;
}

/**
 * Validate a raw or formatted string as a valid TT phone number.
 * Accepts:
 *   - 7 digits (local only)
 *   - 10 digits starting with 868 (area code + local)
 *   - 11 digits starting with 1868 (country code + area + local)
 */
export function isValidTtPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 7) return true;
  if (digits.length === 10 && digits.startsWith("868")) return true;
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
  } else if (digits.length === 10 && digits.startsWith("868")) {
    seven = digits.slice(3);
  } else if (digits.length === 11 && digits.startsWith("1868")) {
    seven = digits.slice(4);
  } else {
    return null;
  }
  return `(868) ${seven.slice(0, 3)}-${seven.slice(3)}`;
}