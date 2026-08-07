/**
 * Notification message templates for both domains.
 *
 * Generates short SMS/WhatsApp bodies and longer HTML email bodies
 * for registration confirmations, event reminders, and post-event
 * surveys. All templates keep the Tobago community voice.
 */

import { SITES, type SiteKey } from "@/sites/site-registry";
import { getVerifyUrl } from "./qr-code";
import { generateQrCodeSvg } from "./qr-code";

export interface RegistrationMessageParams {
  siteKey: SiteKey;
  applicationId: string;
  recipientName: string;
}

function formatDate(siteKey: SiteKey): string {
  const date = new Date(SITES[siteKey].eventDate);
  return date.toLocaleDateString("en-TT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Short SMS/WhatsApp body for registration confirmation.
 */
export function registrationSmsBody(params: RegistrationMessageParams): string {
  const { siteKey, applicationId, recipientName } = params;
  const site = SITES[siteKey];
  const date = formatDate(siteKey);
  return `${site.name}: Hi ${recipientName}, your registration is confirmed. Application ID: ${applicationId}. Event: ${date}, Mt. St. George/Goodwood, Tobago. Bring your ID to collect.`;
}

/**
 * Event reminder SMS body (sent 48h before event).
 */
export function eventReminderSmsBody(params: RegistrationMessageParams): string {
  const { siteKey, applicationId, recipientName } = params;
  const site = SITES[siteKey];
  const date = formatDate(siteKey);
  return `${site.name}: Reminder ${recipientName}! Event is ${date}. Bring your Application ID ${applicationId} to collect. See you there!`;
}

/**
 * Post-event survey SMS body.
 */
export function surveySmsBody(params: RegistrationMessageParams): string {
  const { siteKey, applicationId, recipientName } = params;
  const site = SITES[siteKey];
  const surveyUrl = `https://${site.host}${site.routePrefix}/survey?aid=${encodeURIComponent(applicationId)}`;
  return `${site.name}: Hi ${recipientName}, did you receive what you needed? Reply with your feedback: ${surveyUrl}`;
}

/**
 * HTML email body for registration confirmation (with QR code).
 */
export async function registrationEmailHtml(
  params: RegistrationMessageParams,
): Promise<string> {
  const { siteKey, applicationId, recipientName } = params;
  const site = SITES[siteKey];
  const date = formatDate(siteKey);
  const verifyUrl = getVerifyUrl(siteKey, applicationId);
  const qrSvg = await generateQrCodeSvg(verifyUrl);

  const accentColor = siteKey === "bts" ? "#0e7490" : "#d97706";
  const accentDeep = siteKey === "bts" ? "#164e63" : "#92400e";
  const accentLight = siteKey === "bts" ? "#ecfeff" : "#fffbeb";
  const accentBorder = siteKey === "bts" ? "#67e8f9" : "#fcd34d";

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,${accentColor},${accentDeep});color:white;padding:24px;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:22px;">${site.name}</h1>
      <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">${site.tagline}</p>
    </div>
    <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Your registration has been received. Save your Application ID. You'll need it to collect
        resources on event day.
      </p>
      <div style="margin:20px 0;border:2px dashed ${accentBorder};background:${accentLight};border-radius:12px;padding:20px;text-align:center;">
        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${accentColor};margin:0;">Your Application ID</p>
        <p style="font-size:28px;font-weight:700;color:${accentDeep};letter-spacing:0.1em;margin:4px 0 12px;">${escapeHtml(applicationId)}</p>
        <div style="display:flex;justify-content:center;margin:12px 0;">
          ${qrSvg}
        </div>
        <p style="font-size:12px;color:#6b7280;margin:8px 0 0;">Scan this QR code at the distribution counter on event day</p>
      </div>
      <div style="margin-top:24px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;">
        <p style="margin:0;font-size:14px;color:#0c4a6e;"><strong>Event date:</strong> ${date}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#0c4a6e;">Mt. St. George/Goodwood, Tobago</p>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#6b7280;">If you did not register, you can ignore this email.</p>
    </div>
  </div>`;
}

/**
 * HTML email body for event reminder.
 */
export function eventReminderEmailHtml(params: RegistrationMessageParams): string {
  const { siteKey, applicationId, recipientName } = params;
  const site = SITES[siteKey];
  const date = formatDate(siteKey);
  const accentColor = siteKey === "bts" ? "#0e7490" : "#d97706";

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:${accentColor};color:white;padding:20px;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:20px;">${site.name} · Event Reminder</h1>
    </div>
    <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi ${escapeHtml(recipientName)},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        This is a reminder that the event is on <strong>${date}</strong> at
        Mt. St. George/Goodwood, Tobago.
      </p>
      <p style="font-size:14px;color:#374151;">Bring your Application ID: <strong>${escapeHtml(applicationId)}</strong></p>
      <p style="margin-top:24px;font-size:12px;color:#6b7280;">See you there!</p>
    </div>
  </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}