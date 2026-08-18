/**
 * Post-registration notification helper.
 *
 * Called by both BTS and MD register API routes after a successful
 * database insert. Sends SMS, WhatsApp, and email with the
 * Application ID and QR code (email only). Falls back to console
 * logging when no real providers are configured.
 */

import { sendSms, sendWhatsapp, toE164 } from "./notifications";
import { sendEmail } from "./email";
import {
  registrationSmsBody,
  registrationEmailHtml,
} from "./notification-templates";
import type { SiteKey } from "@/sites/site-registry";

export interface PostRegistrationParams {
  siteKey: SiteKey;
  applicationId: string;
  recipientName: string;
  phoneNumber: string;
  email?: string | null;
}

/**
 * Send registration confirmation across all available channels.
 * Never throws — notification failures are logged but don't block
 * the registration response.
 */
export async function notifyRegistrationConfirmed(
  params: PostRegistrationParams,
): Promise<void> {
  const { siteKey, applicationId, recipientName, phoneNumber, email } = params;
  const smsBody = registrationSmsBody({ siteKey, applicationId, recipientName });
  const e164 = toE164(phoneNumber);

  // SMS
  if (e164) {
    void sendSms(e164, smsBody).catch((e) =>
      console.error("[notify] SMS failed:", e),
    );
    void sendWhatsapp(e164, smsBody).catch((e) =>
      console.error("[notify] WhatsApp failed:", e),
    );
  }

  // Email with QR code
  if (email && email.trim()) {
    try {
      const html = await registrationEmailHtml({
        siteKey,
        applicationId,
        recipientName,
      });
      void sendEmail({
        to: email,
        subject: `Registration Confirmation · ${applicationId}`,
        html,
        site: siteKey,
      }).catch((e) => console.error("[notify] Email failed:", e));
    } catch (e) {
      console.error("[notify] Email template build failed:", e);
    }
  }
}

/**
 * Send event reminder 48h before.
 * Called by a cron job or admin trigger.
 */
export async function notifyEventReminder(
  params: PostRegistrationParams,
): Promise<void> {
  const { siteKey, applicationId, recipientName, phoneNumber } = params;
  const e164 = toE164(phoneNumber);
  const body = `Reminder: ${recipientName}, your Application ID ${applicationId}. Event is tomorrow. Bring your ID!`;

  if (e164) {
    void sendSms(e164, body).catch((e) =>
      console.error("[notify] Reminder SMS failed:", e),
    );
  }
}

/**
 * Send post-event survey.
 */
export async function notifyPostEventSurvey(
  params: PostRegistrationParams,
): Promise<void> {
  const { siteKey, applicationId, recipientName, phoneNumber } = params;
  const e164 = toE164(phoneNumber);
  const { surveySmsBody } = await import("./notification-templates");
  const body = surveySmsBody({ siteKey, applicationId, recipientName });

  if (e164) {
    void sendSms(e164, body).catch((e) =>
      console.error("[notify] Survey SMS failed:", e),
    );
  }
}