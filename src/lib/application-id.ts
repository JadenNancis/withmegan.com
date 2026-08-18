/**
 * Extract an Application ID from user input.
 *
 * QR codes encode a full verify URL (e.g.
 *   https://backtoschoolwithmegan.tha.tt/bts/verify?aid=BTS-260806-ABC123
 * ) but the user may also paste a raw ID. Handle both.
 */
export function extractApplicationId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // URL form — pull the `aid` query param.
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes("?aid=")) {
    try {
      const url = new URL(trimmed);
      const aid = url.searchParams.get("aid");
      if (aid) return aid;
    } catch {
      // not a valid URL — fall through
    }
  }

  // Raw Application ID form (e.g. BTS-260806-ABC123 or MD-260806-ABC123).
  if (/^(BTS|MD)-\d{6}-[A-Z0-9]{6}$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}
