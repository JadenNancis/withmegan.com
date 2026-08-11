import { Resend } from "resend";

/**
 * Email helper built on Resend.
 *
 * Falls back to a console log when RESEND_API_KEY is absent so dev works
 * without configuration. In production the key must be set — the helper
 * logs a warning but never throws, so a failed email never blocks a
 * registration.
 */

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — emails will be logged, not sent.");
    return null;
  }
  client = new Resend(apiKey);
  return client;
}

const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "Back to School with Megan <noreply@withmegan.com>";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.info("[email] (dev) would send:", {
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
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

export function btsRegistrationConfirmationHtml(params: {
  guardianName: string;
  thaId: string;
  dependents: Array<{ studentName: string; schoolName: string }>;
  eventDate: string;
}): string {
  const dependentRows = params.dependents
    .map(
      (d) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(d.studentName)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(d.schoolName)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Registration Confirmation</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
  <div style="background:linear-gradient(135deg,#0e7490,#164e63);border-radius:16px;padding:32px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;margin:0;">Back to School with Megan</h1>
    <p style="color:#cffafe;margin:8px 0 0;font-size:14px;">Book Drive · Mt. St. George/Goodwood, Tobago</p>
  </div>
  <div style="margin-top:24px;">
    <p>Hi ${escapeHtml(params.guardianName)},</p>
    <p>Your registration has been received. Save your Application ID. You'll need it to collect resources on event day.</p>
    <div style="margin:20px 0;border:2px dashed #67e8f9;background:#ecfeff;border-radius:12px;padding:20px;text-align:center;">
      <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#0e7490;margin:0;">Your Application ID</p>
      <p style="font-size:28px;font-weight:700;color:#164e63;letter-spacing:0.1em;margin:4px 0 0;">${escapeHtml(params.thaId)}</p>
    </div>
    <h2 style="font-size:18px;color:#111827;">Registered Dependents</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:6px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;">Child/Student</th>
          <th style="padding:6px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;">School</th>
        </tr>
      </thead>
      <tbody>${dependentRows}</tbody>
    </table>
    <div style="margin-top:24px;background:#f0f9ff;border:1px solid #a5f3fc;border-radius:8px;padding:16px;">
      <p style="margin:0;font-size:14px;color:#164e63;"><strong>Event date:</strong> ${escapeHtml(params.eventDate)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#164e63;">Bring your Application ID to collect books and supplies.</p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">If you did not register, you can ignore this email.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}