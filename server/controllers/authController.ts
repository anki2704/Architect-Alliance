import { Response } from 'express';
import { createHmac, randomInt } from 'crypto';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthedRequest } from '../middleware/auth';
import { sendOtpEmail } from '../utils/email';
import { revokeToken } from '../utils/tokenBlacklist';
import { validatePasswordStrength } from '../utils/passwordPolicy';
import { normalizeEmail, isValidEmail, isValidPhone, cleanString } from '../utils/validation';

const MAX_FAILED_ATTEMPTS = 3;
const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function hashOtp(otp: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return createHmac('sha256', secret).update(otp).digest('hex');
}

export async function register(req: AuthedRequest, res: Response) {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedName = cleanString(name, 100);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = cleanString(phone, 20);

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid contact number.' });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: 'customer',
      phone: normalizedPhone || undefined
    });

    const token = generateToken(user.id);
    res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('[Auth] Registration failed', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

export async function login(req: AuthedRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password +otpCode +otpExpires +otpAttempts'
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        error:
          'Account temporarily locked after 3 failed attempts. Please verify with the OTP sent to your email.',
        requiresOtp: true,
        email: user.email
      });
    }

    const passwordOk = await user.matchPassword(password);
    if (!passwordOk) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        const otp = generateOtp();
        user.otpCode = hashOtp(otp);
        user.otpAttempts = 0;
        user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
        user.lockUntil = new Date(Date.now() + OTP_TTL_MS);
        await user.save();
        const delivery = await sendOtpEmail(user.email, otp, 'login-lock');

        return res.status(403).json({
          error:
            'Too many failed attempts. An OTP has been sent to your email. Enter it to continue.',
          requiresOtp: true,
          email: user.email,
          emailSent: delivery.sent,
          devOtp:
            process.env.NODE_ENV === 'production' || delivery.via === 'email' ? undefined : otp
        });
      }

      await user.save();
      const left = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      return res.status(401).json({
        error: `Invalid email or password. ${left} attempt${left === 1 ? '' : 's'} remaining before OTP verification is required.`
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    const token = generateToken(user.id);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('[Auth] Login failed', err);
    res.status(500).json({ error: 'Login failed.' });
  }
}

export async function verifyLoginOtp(req: AuthedRequest, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otpCode +otpExpires +password +otpAttempts'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({
        error: 'OTP expired. Please try logging in again to receive a new one.'
      });
    }

    if ((user.otpAttempts || 0) >= 5) {
      user.otpCode = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ error: 'Too many OTP attempts. Please request a new OTP.' });
    }

    if (user.otpCode !== hashOtp(String(otp).trim())) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    const token = generateToken(user.id);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('[Auth] OTP verification failed', err);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
}

/**
 * Forgot password works for every role (admin, designer, customer).
 * OTP is emailed to the account's registered address.
 * Also used as "Resend OTP" for the reset-password flow.
 */
export async function forgotPassword(req: AuthedRequest, res: Response) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otpCode +otpExpires +otpAttempts'
    );
    if (!user) {
      return res.json({
        message: 'If an account exists with that email, an OTP has been sent.',
        emailSent: false
      });
    }

    const otp = generateOtp();
    user.otpCode = hashOtp(otp);
    user.otpAttempts = 0;
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    const delivery = await sendOtpEmail(user.email, otp, 'forgot-password');

    const message = delivery.sent
      ? 'OTP sent to your email. Check your inbox and spam folder.'
      : 'OTP generated. Email delivery failed — check server console or configure EMAIL_USER / EMAIL_PASS in .env.';

    res.json({
      message,
      email: user.email,
      emailSent: delivery.sent,
      devOtp:
        process.env.NODE_ENV === 'production' || delivery.via === 'email' ? undefined : otp
    });
  } catch (err) {
    console.error('[Auth] Forgot password failed', err);
    res.status(500).json({ error: 'Could not process request.' });
  }
}

/**
 * Resend login-lock OTP (after 3 failed attempts).
 */
export async function resendLoginOtp(req: AuthedRequest, res: Response) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otpCode +otpExpires +otpAttempts'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const otp = generateOtp();
    user.otpCode = hashOtp(otp);
    user.otpAttempts = 0;
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    user.lockUntil = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    const delivery = await sendOtpEmail(user.email, otp, 'login-lock');

    res.json({
      message: delivery.sent
        ? 'A new OTP has been sent to your email.'
        : 'OTP regenerated. Email delivery failed — check server logs / .env credentials.',
      email: user.email,
      emailSent: delivery.sent,
      devOtp:
        process.env.NODE_ENV === 'production' || delivery.via === 'email' ? undefined : otp
    });
  } catch (err) {
    console.error('[Auth] Resend login OTP failed', err);
    res.status(500).json({ error: 'Could not resend OTP.' });
  }
}

export async function resetPassword(req: AuthedRequest, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email?.trim() || !otp?.trim() || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otpCode +otpExpires +password +otpAttempts'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if ((user.otpAttempts || 0) >= 5) {
      user.otpCode = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ error: 'Too many OTP attempts. Please request a new OTP.' });
    }
    if (user.otpCode !== hashOtp(String(otp).trim())) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('[Auth] Reset password failed', err);
    res.status(500).json({ error: 'Could not reset password.' });
  }
}

export async function getMe(req: AuthedRequest, res: Response) {
  res.json({ user: req.user!.toJSON() });
}

/**
 * Server-side logout: blacklists the current JWT so it can no longer
 * be used even if still within its token expiry window.
 */
export async function logout(req: AuthedRequest, res: Response) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      if (token) {
        await revokeToken(token);
      }
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[Auth] Logout failed', err);
    res.status(500).json({ error: 'Logout failed.' });
  }
}
