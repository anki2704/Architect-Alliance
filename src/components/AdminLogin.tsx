import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setStoredAuth, ApiError } from '../services/api';
import { User } from '../types';
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

type Step = 'login' | 'forgot' | 'otp' | 'reset';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [isForgotFlow, setIsForgotFlow] = useState(false); // true = forgot password, false = login-lock

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // ---------- Timer ----------
  const startOtpTimer = () => {
    setOtpTimer(5 * 60); // 5 minutes
  };

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ---------- LOGIN ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(email.trim(), password);

      if ('requiresOtp' in result && result.requiresOtp) {
        // Login-lock OTP (after 3 failed attempts)
        setIsForgotFlow(false);
        setStep('otp');
        startOtpTimer();
        if (result.devOtp) setDevOtp(result.devOtp);
        setError(result.error || 'OTP required. Check your email.');
        setLoading(false);
        return;
      }

      const { user, token } = result as { user: User; token: string };

      if (user.role !== 'admin' && user.role !== 'designer') {
        setError('Access denied. Only admin/designer accounts can login here.');
        setLoading(false);
        return;
      }

      setStoredAuth(user, token);
      onLoginSuccess(user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- VERIFY LOGIN-LOCK OTP ----------
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await authApi.verifyOtp(email.trim(), otp.trim());

      if (user.role !== 'admin' && user.role !== 'designer') {
        setError('Access denied. Only admin/designer accounts can login here.');
        setLoading(false);
        return;
      }

      setStoredAuth(user, token);
      onLoginSuccess(user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD → SEND OTP ----------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await authApi.forgotPassword(email.trim());
      setSuccess(data.message || 'OTP sent to your email.');
      if (data.devOtp) setDevOtp(data.devOtp);
      setIsForgotFlow(true);
      setStep('otp');
      startOtpTimer();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- RESEND OTP ----------
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      let data;
      if (isForgotFlow) {
        data = await authApi.forgotPassword(email.trim());
      } else {
        data = await authApi.resendLoginOtp(email.trim());
      }

      setSuccess(data.message || 'New OTP sent to your email.');
      if (data.devOtp) setDevOtp(data.devOtp);
      startOtpTimer();
      setOtp('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  // ---------- RESET PASSWORD (OTP + New Password) ----------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccess('Password updated successfully! You can now login.');
      setTimeout(() => {
        setStep('login');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setDevOtp(null);
        setSuccess('');
        setError('');
        setOtpTimer(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    setSuccess('');
    setDevOtp(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpTimer(0);

    if (step === 'otp') {
      setStep(isForgotFlow ? 'forgot' : 'login');
    } else {
      setStep('login');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-warm)]/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[var(--accent-warm)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {step === 'login' && 'Admin Login'}
                {step === 'forgot' && 'Forgot Password'}
                {step === 'otp' && (isForgotFlow ? 'Reset Password' : 'Verify OTP')}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {step === 'login' ? 'Restricted access' : 'Enter details to continue'}
              </p>
            </div>
          </div>

          {/* ========== LOGIN STEP ========== */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent-warm)] text-[var(--text-on-accent)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--accent-warm-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('forgot');
                  setError('');
                  setPassword('');
                }}
                className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors"
              >
                Forgot Password?
              </button>
            </form>
          )}

          {/* ========== FORGOT PASSWORD (Email only) ========== */}
          {step === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Enter your email and we’ll send you an OTP to reset your password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-lg">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent-warm)] text-[var(--text-on-accent)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--accent-warm-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
            </form>
          )}

          {/* ========== OTP STEP ========== */}
          {step === 'otp' && (
            <form
              onSubmit={isForgotFlow ? handleResetPassword : handleVerifyLoginOtp}
              className="space-y-5"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                {isForgotFlow
                  ? <>Enter the OTP sent to <strong>{email}</strong> and set a new password.</>
                  : <>Enter the OTP sent to <strong>{email}</strong> to unlock your account.</>}
              </p>

              {devOtp && (
                <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
                  Dev OTP: <strong>{devOtp}</strong>
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors tracking-widest text-center"
                  placeholder="000000"
                />
              </div>

              {/* Timer + Resend */}
              <div className="flex items-center justify-between text-sm">
                {otpTimer > 0 ? (
                  <p className="text-[var(--text-secondary)]">
                    Resend OTP in{' '}
                    <span className="font-semibold text-[var(--accent-warm)]">
                      {formatTimer(otpTimer)}
                    </span>
                  </p>
                ) : (
                  <p className="text-[var(--text-secondary)]">Didn't receive OTP?</p>
                )}

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || resendLoading}
                  className="flex items-center gap-1.5 text-[var(--accent-warm)] hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {resendLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Resend OTP
                </button>
              </div>

              {/* Only show New Password fields in Forgot flow */}
              {isForgotFlow && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--text-primary)]/15 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-warm)] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-lg">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent-warm)] text-[var(--text-on-accent)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--accent-warm-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isForgotFlow ? 'Updating...' : 'Verifying...'}
                  </>
                ) : isForgotFlow ? (
                  'Reset Password'
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          This page is not linked publicly.
        </p>
      </div>
    </div>
  );
};