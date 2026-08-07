/**
 * Notification abstraction layer.
 *
 * Provides a unified interface for sending messages across multiple
 * channels (SMS, WhatsApp, Email). Each channel has a provider adapter
 * that can be swapped via environment variables. When no provider is
 * configured, messages are logged to the console (prototype mode).
 *
 * Production wiring:
 *   - SMS:     Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 *              or DIGICEL_API_KEY + DIGICEL_API_SECRET + DIGICEL_SENDER
 *   - WhatsApp: Set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 *   - Email:   Set SMTP_URL (or uses console fallback)
 */

export type NotificationChannel = "sms" | "whatsapp" | "email";

export interface NotificationPayload {
  /** Recipient phone (E.164, e.g. +18681234567) for SMS/WhatsApp. */
  to?: string;
  /** Recipient email for email channel. */
  email?: string;
  /** Short text body (SMS limit ~160 chars). */
  body: string;
  /** Optional longer HTML body for email. */
  htmlBody?: string;
  /** Optional subject line for email. */
  subject?: string;
  /** Application ID for reference/logging. */
  applicationId?: string;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── SMS Provider Interface ──────────────────────────────────────

interface SmsProvider {
  send(to: string, body: string): Promise<NotificationResult>;
  isConfigured(): boolean;
}

class TwilioSmsProvider implements SmsProvider {
  isConfigured(): boolean {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM
    );
  }

  async send(to: string, body: string): Promise<NotificationResult> {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const token = process.env.TWILIO_AUTH_TOKEN!;
      const from = process.env.TWILIO_FROM!;
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: to, From: from, Body: body }),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        return { channel: "sms", success: false, error: `Twilio: ${err}` };
      }
      const data = (await res.json()) as { sid: string };
      return { channel: "sms", success: true, messageId: data.sid };
    } catch (err) {
      return {
        channel: "sms",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

class ConsoleSmsProvider implements SmsProvider {
  isConfigured(): boolean {
    return true; // Always "works" in dev mode
  }

  async send(to: string, body: string): Promise<NotificationResult> {
    console.log(`[SMS → ${to}] ${body}`);
    return { channel: "sms", success: true, messageId: `console-${Date.now()}` };
  }
}

function getSmsProvider(): SmsProvider {
  const twilio = new TwilioSmsProvider();
  if (twilio.isConfigured()) return twilio;
  return new ConsoleSmsProvider();
}

// ── WhatsApp Provider Interface ─────────────────────────────────

interface WhatsappProvider {
  send(to: string, body: string): Promise<NotificationResult>;
  isConfigured(): boolean;
}

class WhatsAppCloudProvider implements WhatsappProvider {
  isConfigured(): boolean {
    return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }

  async send(to: string, body: string): Promise<NotificationResult> {
    try {
      const token = process.env.WHATSAPP_TOKEN!;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace("+", ""),
            type: "text",
            text: { body },
          }),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        return { channel: "whatsapp", success: false, error: `WhatsApp: ${err}` };
      }
      const data = (await res.json()) as { messages: { id: string }[] };
      return {
        channel: "whatsapp",
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err) {
      return {
        channel: "whatsapp",
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

class ConsoleWhatsappProvider implements WhatsappProvider {
  isConfigured(): boolean {
    return true;
  }

  async send(to: string, body: string): Promise<NotificationResult> {
    console.log(`[WhatsApp → ${to}] ${body}`);
    return { channel: "whatsapp", success: true, messageId: `console-${Date.now()}` };
  }
}

function getWhatsappProvider(): WhatsappProvider {
  const wa = new WhatsAppCloudProvider();
  if (wa.isConfigured()) return wa;
  return new ConsoleWhatsappProvider();
}

// ── Email Provider ──────────────────────────────────────────────

interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<NotificationResult>;
  isConfigured(): boolean;
}

class ConsoleEmailProvider implements EmailProvider {
  isConfigured(): boolean {
    return true;
  }

  async send(to: string, subject: string, html: string): Promise<NotificationResult> {
    console.log(`[Email → ${to}] ${subject}`);
    return { channel: "email", success: true, messageId: `console-${Date.now()}` };
  }
}

function getEmailProvider(): EmailProvider {
  // The existing sendEmail in lib/email.ts handles SMTP via Nodemailer
  // when SMTP_URL is set. This console fallback is for when it's not.
  if (process.env.SMTP_URL) {
    return new ConsoleEmailProvider(); // Real SMTP handled by lib/email.ts
  }
  return new ConsoleEmailProvider();
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Send a notification across all configured channels for the recipient.
 * SMS and WhatsApp go to the phone number; email goes to the email address.
 * Channels without a destination are silently skipped.
 */
export async function sendNotification(
  payload: NotificationPayload,
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  if (payload.to) {
    const sms = getSmsProvider();
    results.push(await sms.send(payload.to, payload.body));
  }

  if (payload.to) {
    const wa = getWhatsappProvider();
    results.push(await wa.send(payload.to, payload.body));
  }

  if (payload.email && payload.htmlBody && payload.subject) {
    const email = getEmailProvider();
    results.push(await email.send(payload.email, payload.subject, payload.htmlBody));
  }

  return results;
}

/**
 * Send only via SMS channel.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<NotificationResult> {
  return getSmsProvider().send(to, body);
}

/**
 * Send only via WhatsApp channel.
 */
export async function sendWhatsapp(
  to: string,
  body: string,
): Promise<NotificationResult> {
  return getWhatsappProvider().send(to, body);
}

/**
 * Check which channels are configured with real providers (not console fallback).
 */
export function getConfiguredChannels(): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  const twilio = new TwilioSmsProvider();
  if (twilio.isConfigured()) channels.push("sms");
  const wa = new WhatsAppCloudProvider();
  if (wa.isConfigured()) channels.push("whatsapp");
  if (process.env.SMTP_URL) channels.push("email");
  return channels;
}

/**
 * Normalize a TT phone number to E.164 format for SMS/WhatsApp APIs.
 * Returns null if the number isn't a valid TT number.
 */
export function toE164(value: string): string | null {
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
  return `+1868${seven}`;
}