import nodemailer from 'nodemailer';

/**
 * Fire-and-forget email to the studio admin when a new enquiry or booking
 * comes in. Deliberately simpler than sendOtpEmail (server/utils/email.ts):
 * a missed notification just means the admin checks the dashboard a bit
 * later, so this never throws and never delays the API response — callers
 * should call it without `await` and let it log its own outcome.
 *
 * Reuses EMAIL_USER/EMAIL_PASS (same Gmail App Password as OTP delivery).
 * Recipient: ADMIN_NOTIFY_EMAIL, falling back to SEED_ADMIN_EMAIL. If
 * neither is set, or EMAIL_USER/EMAIL_PASS are missing, this is a no-op.
 */
export async function notifyAdmin(subject: string, text: string, html: string): Promise<void> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '').trim();
  const to = (process.env.ADMIN_NOTIFY_EMAIL || process.env.SEED_ADMIN_EMAIL)?.trim();

  if (!user || !pass || !to) return; // Not configured — silently skip.

  try {
    const customHost = process.env.SMTP_HOST?.trim();
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;

    const transport = nodemailer.createTransport({
      ...(customHost
        ? { host: customHost, port, secure: port === 465, requireTLS: port === 587 }
        : { service: 'gmail' }),
      auth: { user, pass },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true
    });

    const from = process.env.EMAIL_FROM?.trim() || `Architecture Alliance <${user}>`;
    if (/[\r\n]/.test(from)) return; // Same CRLF guard as email.ts.

    await transport.sendMail({ from, to, subject, text, html });
    console.log(`[AdminNotify] Sent "${subject}" to ${to}`);
  } catch (err) {
    // Never throw — a failed notification must not affect the request that triggered it.
    console.error('[AdminNotify] Failed to send:', err instanceof Error ? err.message : err);
  }
}
