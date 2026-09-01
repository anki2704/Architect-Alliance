import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getMe,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  resendLoginOtp,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' }
});

// Slightly stricter for OTP send / resend to reduce abuse
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please try again in a few minutes.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyLoginOtp);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/resend-login-otp', otpLimiter, resendLoginOtp);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
