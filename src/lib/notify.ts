/**
 * Post-registration notification helper.
 *
 * Called by both BTS and MD register API routes after a successful
 * database insert. Email is the only channel: the Application ID and QR
 * code are shown on screen at the end of registration, and the email is
 * the backup copy. Falls back to console logging when no real email
 * provider is configured.
 */

import { sendEmail } from "./email";
import {
  registrationEmailHtml,
  eventReminderEmailHtml,
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
 * Email the registration confirmation. Never throws — notification
 * failures are logged but don't block the registration response.
 */
export async function notifyRegistrationConfirmed(
  params: PostRegistrationParams,
): Promise<void> {
  const { siteKey, applicationId, recipientName, email } = params;

  if (!email || !email.trim()) return;

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

/**
 * Email an event reminder ahead of collection day.
 * Called by a cron job or admin trigger.
 */
export async function notifyEventReminder(
  params: PostRegistrationParams,
): Promise<void> {
  const { siteKey, applicationId, recipientName, email } = params;

  if (!email || !email.trim()) return;

  try {
    const html = eventReminderEmailHtml({ siteKey, applicationId, recipientName });
    void sendEmail({
      to: email,
      subject: `Event Reminder · ${applicationId}`,
      html,
      site: siteKey,
    }).catch((e) => console.error("[notify] Reminder email failed:", e));
  } catch (e) {
    console.error("[notify] Reminder template build failed:", e);
  }
}
