import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Sends OTP emails via Gmail SMTP (or any SMTP configured in env).
 *
 * Required env for real delivery:
 *   EMAIL_USER  – Gmail address (e.g. yourapp@gmail.com)
 *   EMAIL_PASS  – Gmail App Password (16 chars; spaces are stripped automatically)
 *
 * Optional:
 *   EMAIL_FROM  – display From header (defaults to "Architecture Alliance <EMAIL_USER>")
 *   SMTP_HOST   – defaults to smtp.gmail.com (leave unset for Gmail)
 *   SMTP_PORT   – defaults to 465 (or 587 if you prefer STARTTLS)
 *
 * If EMAIL_USER / EMAIL_PASS are missing, falls back to console.log
 * so local development still works without mail credentials.
 */
export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'login-lock' | 'forgot-password'
): Promise<{ sent: boolean; via: 'email' | 'console'; error?: string }> {
  const subject =
    purpose === 'forgot-password'
      ? 'Architech Alliance — Password Reset OTP'
      : 'Architech Alliance — Login Verification OTP';

  const purposeLabel =
    purpose === 'forgot-password'
      ? 'reset your password'
      : 'unlock your account after failed login attempts';

  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1A1918;">
      <h2 style="margin: 0 0 12px; font-size: 20px;">Architecture Alliance</h2>
      <p style="margin: 0 0 16px; color: #555;">Use this one-time code to ${purposeLabel}:</p>
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; background: #FAF8F5; border: 1px solid #e5e2de; border-radius: 12px; padding: 16px 20px; text-align: center;">
        ${otp}
      </div>
      <p style="margin: 16px 0 0; font-size: 13px; color: #777;">
        This code expires in <strong>10 minutes</strong>. If you did not request it, you can ignore this email.
      </p>
    </div>
  `;

  const text = `Architecture Alliance\n\nYour OTP to ${purposeLabel}: ${otp}\n\nExpires in 10 minutes.`;

  // Gmail App Passwords are often copied with spaces — strip them
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '').trim();

  if (!user || !pass) {
    console.log(`\n[OTP] ${purpose} for ${to}: ${otp}`);
    console.log(
      '[OTP] EMAIL_USER / EMAIL_PASS not set — OTP printed to console only.\n' +
        '      Fix: set EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env, then restart the server.\n'
    );
    return { sent: false, via: 'console', error: 'EMAIL_USER / EMAIL_PASS not set' };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || `Architecture Alliance <${user}>`;

  const customHost = process.env.SMTP_HOST?.trim();
  const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;

  const transports: Transporter[] = [];

  if (customHost) {
    const port = envPort || 465;
    transports.push(
      nodemailer.createTransport({
        host: customHost,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000
      })
    );
  } else {
    // Primary: nodemailer Gmail service
    transports.push(
      nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000
      })
    );
    // Fallback: explicit SMTP on 587 (STARTTLS) — helps on some networks
    if (!envPort || envPort === 587) {
      transports.push(
        nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: { user, pass },
          connectionTimeout: 15_000,
          greetingTimeout: 10_000,
          socketTimeout: 20_000
        })
      );
    }
    // Fallback: 465 SSL
    if (!envPort || envPort === 465) {
      transports.push(
        nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user, pass },
          connectionTimeout: 15_000,
          greetingTimeout: 10_000,
          socketTimeout: 20_000
        })
      );
    }
  }

  let lastError = '';

  for (let i = 0; i < transports.length; i++) {
    try {
      await transports[i].sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log(`[OTP] Email sent to ${to} (${purpose}) via transport #${i + 1}`);
      return { sent: true, via: 'email' };
    } catch (err) {
      lastError = (err as Error).message || String(err);
      console.error(`[OTP] Transport #${i + 1} failed:`, lastError);
    }
  }

  if (/Invalid login|BadCredentials|Username and Password not accepted/i.test(lastError)) {
    console.error(
      '[OTP] Hint: Use a Gmail App Password (not your normal password).\n' +
        '      Google Account → Security → 2-Step Verification → App passwords.\n' +
        '      Paste the 16-character password into EMAIL_PASS (spaces are OK).\n' +
        '      Also remove any leading/trailing spaces around EMAIL_PASS in .env.'
    );
  } else if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|certificate/i.test(lastError)) {
    console.error(
      '[OTP] Hint: Network/TLS issue. Try SMTP_PORT=587 in .env, or check firewall/proxy.'
    );
  }

  // Never block auth flows if mail fails — still log OTP for recovery in dev
  console.log(`\n[OTP] FALLBACK ${purpose} for ${to}: ${otp}\n`);
  return { sent: false, via: 'console', error: lastError };
}
