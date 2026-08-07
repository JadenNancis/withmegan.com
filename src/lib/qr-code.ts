/**
 * QR code generation for Application IDs.
 *
 * Generates QR codes as data URLs that encode the Application ID.
 * Used on registration success pages, in emails, and for event-day
 * scan-to-verify. The QR encodes a URL like:
 *   https://backtoschoolwithmegan.tha.tt/verify?aid=BTS-260806-ABC123
 *
 * Scanning the QR code opens the verify page, which looks up the
 * registrant by Application ID.
 */

import QRCode from "qrcode";
import { SITES, type SiteKey } from "@/sites/site-registry";

/**
 * Generate the verification URL encoded in the QR code.
 * Uses the site's canonical production host.
 */
export function getVerifyUrl(siteKey: SiteKey, applicationId: string): string {
  const host = SITES[siteKey].host;
  const prefix = SITES[siteKey].routePrefix;
  return `https://${host}${prefix}/verify?aid=${encodeURIComponent(applicationId)}`;
}

/**
 * Generate a QR code as a PNG data URL.
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 256,
    margin: 2,
    color: {
      dark: "#0c4a6e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a QR code as an SVG string (for email templates).
 */
export async function generateQrCodeSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: 200,
    margin: 2,
    color: {
      dark: "#0c4a6e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}