import { Resend } from "resend";
import type { SiteKey } from "@/sites/site-registry";

/**
 * Email helper built on Resend.
 *
 * Each site sends through its own Resend API key so the "from" identity
 * and quotas stay separate (BTS uses RESEND_API_KEY_BTS, MD uses
 * RESEND_API_KEY_MD, with RESEND_API_KEY as a shared fallback).
 *
 * Falls back to a console log when no key is present so dev works
 * without configuration. In production the key must be set — the helper
 * logs a warning but never throws, so a failed email never blocks a
 * registration.
 */

const clients = new Map<string, Resend>();

function getClient(site?: SiteKey): Resend | null {
  const key =
    (site === "bts" && process.env.RESEND_API_KEY_BTS) ||
    (site === "md" && process.env.RESEND_API_KEY_MD) ||
    process.env.RESEND_API_KEY;

  if (!key) {
    console.warn("[email] no RESEND_API_KEY set — emails will be logged, not sent.");
    return null;
  }

  const cacheKey = `${site ?? "default"}:${key.slice(0, 8)}`;
  let client = clients.get(cacheKey);
  if (!client) {
    client = new Resend(key);
    clients.set(cacheKey, client);
  }
  return client;
}

function fromAddress(site?: SiteKey): string {
  const siteFrom =
    (site === "bts" && process.env.FROM_EMAIL_BTS) ||
    (site === "md" && process.env.FROM_EMAIL_MD);
  if (siteFrom) return siteFrom;
  if (process.env.FROM_EMAIL) return process.env.FROM_EMAIL;
  return site === "md"
    ? "Market Day with Megan <noreply@mdwithmegan.com>"
    : "Back to School with Megan <noreply@btswithmegan.com>";
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Which site's Resend key + from address to use. */
  site?: SiteKey;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const resend = getClient(params.site);
  if (!resend) {
    console.info("[email] (dev) would send:", {
      site: params.site ?? "default",
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(params.site),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] Resend returned error:", error);
    }
  } catch (err) {
    console.error("[email] failed to send:", err);
  }
}