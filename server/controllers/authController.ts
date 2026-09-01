import { Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthedRequest } from '../middleware/auth';
import { sendOtpEmail } from '../utils/email';
import { revokeToken } from '../utils/tokenBlacklist';
import { validatePasswordStrength } from '../utils/passwordPolicy';

const MAX_FAILED_ATTEMPTS = 3;
const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function register(req: AuthedRequest, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'customer',
      phone: phone?.trim() || undefined
    });

    const token = generateToken(user.id);
    res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: (err as Error).message });
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
      '+password +otpCode +otpExpires'
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
        user.otpCode = otp;
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
    await user.save();

    const token = generateToken(user.id);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: (err as Error).message });
  }
}

export async function verifyLoginOtp(req: AuthedRequest, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+otpCode +otpExpires +password'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({
        error: 'OTP expired. Please try logging in again to receive a new one.'
      });
    }

    if (user.otpCode !== String(otp).trim()) {
      return res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user.id);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed.', details: (err as Error).message });
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
      '+otpCode +otpExpires'
    );
    if (!user) {
      return res.json({
        message: 'If an account exists with that email, an OTP has been sent.',
        emailSent: false
      });
    }

    const otp = generateOtp();
    user.otpCode = otp;
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
    res.status(500).json({ error: 'Could not process request.', details: (err as Error).message });
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
      '+otpCode +otpExpires'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const otp = generateOtp();
    user.otpCode = otp;
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
    res.status(500).json({ error: 'Could not resend OTP.', details: (err as Error).message });
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
      '+otpCode +otpExpires +password'
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (user.otpCode !== String(otp).trim()) {
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpires = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not reset password.', details: (err as Error).message });
  }
}

export async function getMe(req: AuthedRequest, res: Response) {
  res.json({ user: req.user!.toJSON() });
}

/**
 * Server-side logout: blacklists the current JWT so it can no longer
 * be used even if still within its 30-day expiry window.
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
    res.status(500).json({ error: 'Logout failed.', details: (err as Error).message });
  }
}
