import { Resend } from "resend";
import type { UserRole } from "./schemas.js";

const resendApiKey = process.env.RESEND_API_KEY;
// resend.dev's shared testing domain works with no domain verification of
// your own, but can only deliver to the email the Resend account itself is
// registered under - fine for local/dev, not for real invitee addresses.
// Set MAIL_FROM once a real sending domain is verified.
const mailFrom = process.env.MAIL_FROM ?? "LMS <onboarding@resend.dev>";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function publicAppUrl(): string {
  return process.env.PUBLIC_APP_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
}

// Unlike a voucher (which is created and usable regardless of whether its
// email happens to go out), a support/bug message has nowhere else to
// land - if this send fails, the message is simply gone. So unlike
// sendVoucherEmail below, callers here are expected to tell the sender it
// didn't go through rather than silently treating it as best-effort.
function supportInboxEmail(): string | null {
  return process.env.SUPPORT_EMAIL ?? null;
}

export function voucherSignUpLink(voucherId: string): string {
  return `${publicAppUrl()}/register?voucher=${voucherId}`;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: "student",
  admin: "admin",
  super_admin: "super admin",
};

// Best-effort: never throws. Voucher creation must succeed regardless of
// whether the email actually goes out - the admin can always fall back to
// copying the link from the vouchers list (see GET /api/vouchers). Returns
// false (rather than raising) on any failure, including RESEND_API_KEY
// simply not being configured yet, so the caller can surface a soft
// warning instead of a hard error.
export async function sendVoucherEmail(params: {
  to: string;
  name: string;
  voucherId: string;
  role: UserRole;
  // Absent for an admin/super_admin voucher, which never expires.
  expiresAt?: number;
}): Promise<boolean> {
  const link = voucherSignUpLink(params.voucherId);
  if (!resend) {
    console.warn(`RESEND_API_KEY not set - not sending a voucher email to ${params.to}. Sign-up link: ${link}`);
    return false;
  }

  const expiresLine =
    params.expiresAt !== undefined
      ? `This invitation is valid until ${new Date(params.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`
      : "This invitation doesn't expire.";

  try {
    const result = await resend.emails.send({
      from: mailFrom,
      to: params.to,
      subject: "You're invited to the LMS",
      html: `
        <p>Hi ${escapeHtml(params.name)},</p>
        <p>You've been invited to join as a <strong>${ROLE_LABELS[params.role]}</strong>. Use the link below to set up your account with this email address (<strong>${escapeHtml(params.to)}</strong>):</p>
        <p><a href="${link}">${link}</a></p>
        <p>${expiresLine}</p>
      `,
    });
    if (result.error) {
      console.error(`Failed to send voucher email to ${params.to}:`, result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to send voucher email to ${params.to}:`, err);
    return false;
  }
}

// Shared by sendSupportMessage/sendBugReport below - both are just "relay
// this authenticated user's free-text message to the support inbox," with
// replyTo set to the sender's own address so replying in an email client
// goes straight back to them rather than to the LMS's own sending address.
async function sendInboxEmail(params: { fromName: string; fromEmail: string; subject: string; bodyHtml: string }): Promise<boolean> {
  const inbox = supportInboxEmail();
  if (!inbox) {
    console.warn(`SUPPORT_EMAIL not set - not sending "${params.subject}" from ${params.fromEmail}. Message:\n${params.bodyHtml}`);
    return false;
  }
  if (!resend) {
    console.warn(`RESEND_API_KEY not set - not sending "${params.subject}" from ${params.fromEmail}. Message:\n${params.bodyHtml}`);
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: mailFrom,
      to: inbox,
      replyTo: params.fromEmail,
      subject: params.subject,
      html: `
        <p>From: ${escapeHtml(params.fromName)} (${escapeHtml(params.fromEmail)})</p>
        ${params.bodyHtml}
      `,
    });
    if (result.error) {
      console.error(`Failed to send "${params.subject}" from ${params.fromEmail}:`, result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to send "${params.subject}" from ${params.fromEmail}:`, err);
    return false;
  }
}

export async function sendSupportMessage(params: { fromName: string; fromEmail: string; message: string }): Promise<boolean> {
  return sendInboxEmail({
    fromName: params.fromName,
    fromEmail: params.fromEmail,
    subject: "LMS support request",
    bodyHtml: `<p>${escapeHtml(params.message).replace(/\n/g, "<br>")}</p>`,
  });
}

export async function sendBugReport(params: {
  fromName: string;
  fromEmail: string;
  description: string;
  stepsToReproduce?: string;
  pageUrl?: string;
}): Promise<boolean> {
  const sections = [
    `<p><strong>What happened:</strong><br>${escapeHtml(params.description).replace(/\n/g, "<br>")}</p>`,
    params.stepsToReproduce
      ? `<p><strong>Steps to reproduce:</strong><br>${escapeHtml(params.stepsToReproduce).replace(/\n/g, "<br>")}</p>`
      : "",
    params.pageUrl ? `<p><strong>Page:</strong> ${escapeHtml(params.pageUrl)}</p>` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return sendInboxEmail({ fromName: params.fromName, fromEmail: params.fromEmail, subject: "LMS bug report", bodyHtml: sections });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
