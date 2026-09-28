import { Router } from 'express';
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
import { authLimiter, otpLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyLoginOtp);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/resend-login-otp', otpLimiter, resendLoginOtp);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;