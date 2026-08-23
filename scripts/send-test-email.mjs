/* Sends a test email through a site's Resend configuration.
 * Usage: node --env-file=.env.local scripts/send-test-email.mjs <bts|md> <to-email>
 * Secrets come from the env file (loaded by --env-file), never echoed. */
import { Resend } from "resend";

const site = process.argv[2];
const to = process.argv[3];

if (!["bts", "md"].includes(site)) {
  console.error("usage: node scripts/send-test-email.mjs <bts|md> <to-email>");
  process.exit(1);
}
if (!to) {
  console.error("missing recipient email");
  process.exit(1);
}

const key = site === "bts" ? process.env.RESEND_API_KEY_BTS : process.env.RESEND_API_KEY_MD;
const from = site === "bts" ? process.env.FROM_EMAIL_BTS : process.env.FROM_EMAIL_MD;

if (!key || !from) {
  console.error(`missing ${site.toUpperCase()} key or from-address in .env.local`);
  process.exit(1);
}

const resend = new Resend(key);
console.log(`sending via ${site.toUpperCase()}`);
console.log(`from: ${from}`);
console.log(`to:   ${to}`);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: `Test email · ${site.toUpperCase()} · with Megan`,
  html: `<p>This is a test email from the <strong>${site.toUpperCase()}</strong> site.</p><p>If you are reading this, the Resend email setup is working.</p>`,
});

if (error) {
  console.error("Resend returned an error:");
  console.error(JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log("sent:", data?.id ?? "no id returned");
