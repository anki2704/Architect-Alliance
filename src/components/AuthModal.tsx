import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, setStoredAuth, ApiError } from '../services/api';
import { X, Loader2, Eye, EyeOff, Check, Circle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthTab = 'login' | 'signup' | 'forgot' | 'reset' | 'otp';

const RESEND_COOLDOWN_SEC = 5 * 60; // 5 minutes

function getPasswordChecks(password: string) {
  return {
    exactLength: password.length === 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };
}

function isPasswordStrong(password: string) {
  const c = getPasswordChecks(password);
  return c.exactLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial;
}

const PasswordChecklist: React.FC<{ password: string }> = ({ password }) => {
  const c = getPasswordChecks(password);
  const items: { ok: boolean; label: string }[] = [
    { ok: c.exactLength, label: 'Exactly 8 characters' },
    { ok: c.hasUpper, label: 'One uppercase letter (A–Z)' },
    { ok: c.hasLower, label: 'One lowercase letter (a–z)' },
    { ok: c.hasNumber, label: 'One number (0–9)' },
    { ok: c.hasSpecial, label: 'One special character (!@#$%…)' }
  ];
  return (
    <ul className="mt-2 space-y-1">
      {items.map((item) => (
        <li
          key={item.label}
          className={`flex items-center gap-1.5 text-[11px] ${
            item.ok ? 'text-emerald-600' : 'text-[var(--text-muted)]'
          }`}
        >
          {item.ok ? (
            <Check className="w-3 h-3 shrink-0" />
          ) : (
            <Circle className="w-3 h-3 shrink-0" />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
};

function formatCountdown(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isOpen && (window as any).lenis) (window as any).lenis.stop();
    return () => {
      if (isOpen && (window as any).lenis) (window as any).lenis.start();
    };
  }, [isOpen]);

  // Countdown ticker for resend OTP
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const startResendCooldown = useCallback(() => {
    setResendSeconds(RESEND_COOLDOWN_SEC);
  }, []);

  if (!isOpen) return null;

  const resetFormFields = () => {
    setPassword('');
    setName('');
    setPhone('');
    setOtp('');
    setNewPassword('');
    setErrorMsg('');
    setInfoMsg('');
    setDevOtpHint('');
    setShowPassword(false);
    setShowNewPassword(false);
    setResendSeconds(0);
  };

  const finishLogin = (user: User, token: string) => {
    setStoredAuth(user, token);
    onLoginSuccess(user);
    setEmail('');
    resetFormFields();
    setTab('login');
    onClose();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const result = await authApi.login(email.trim(), password);
      if ('requiresOtp' in result && result.requiresOtp) {
        setTab('otp');
        setInfoMsg(result.error || 'Enter the OTP sent to your email.');
        if (result.devOtp) setDevOtpHint(`Dev OTP: ${result.devOtp}`);
        if (result.email) setEmail(result.email);
        startResendCooldown();
        return;
      }
      if (result.user && result.token) {
        finishLogin(result.user, result.token);
      }
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill name, email and password.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    if (!isPasswordStrong(password)) {
      setErrorMsg(
        'Password must be exactly 8 characters and include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { user, token } = await authApi.register(
        name.trim(),
        email.trim(),
        password,
        phone.trim()
      );
      finishLogin(user, token);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Sign up failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMsg('Please enter the OTP.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { user, token } = await authApi.verifyOtp(email.trim(), otp.trim());
      finishLogin(user, token);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setInfoMsg('');
    setDevOtpHint('');
    try {
      const res = await authApi.forgotPassword(email.trim());
      setInfoMsg(
        res.emailSent
          ? (res.message || 'OTP sent.') + ' Check your Gmail inbox (and spam folder).'
          : (res.message || 'OTP request processed.') +
              (res.devOtp ? '' : ' If no email arrives, check server console / .env credentials.')
      );
      if (res.devOtp) setDevOtpHint(`Dev OTP: ${res.devOtp}`);
      setTab('reset');
      startResendCooldown();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || isResending || !email.trim()) return;
    setIsResending(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      if (tab === 'otp') {
        const res = await authApi.resendLoginOtp(email.trim());
        setInfoMsg(res.message || 'OTP resent.');
        if (res.devOtp) setDevOtpHint(`Dev OTP: ${res.devOtp}`);
      } else {
        const res = await authApi.forgotPassword(email.trim());
        setInfoMsg(
          res.emailSent
            ? 'A new OTP has been sent to your email.'
            : res.message || 'OTP regenerated.'
        );
        if (res.devOtp) setDevOtpHint(`Dev OTP: ${res.devOtp}`);
      }
      startResendCooldown();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Could not resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const handleReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setErrorMsg('Please enter OTP and new password.');
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setErrorMsg(
        'Password must be exactly 8 characters and include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await authApi.resetPassword(email.trim(), otp.trim(), newPassword);
      setInfoMsg(res.message);
      setTab('login');
      setOtp('');
      setNewPassword('');
      setDevOtpHint('');
      setResendSeconds(0);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') return handleLogin();
    if (tab === 'signup') return handleSignup();
    if (tab === 'otp') return handleVerifyOtp();
    if (tab === 'forgot') return handleForgot();
    if (tab === 'reset') return handleReset();
  };

  const titleMap: Record<AuthTab, string> = {
    login: 'Welcome back',
    signup: 'Create account',
    forgot: 'Forgot password',
    reset: 'Reset password',
    otp: 'Email verification'
  };

  const subtitleMap: Record<AuthTab, string> = {
    login: 'Sign in to your Architecture Alliance account.',
    signup: 'Join to track projects and consultations.',
    forgot: 'We will send a one-time code to your email (works for admin, designer & client).',
    reset: 'Enter the OTP from your email and choose a new password.',
    otp: 'Enter the 6-digit OTP sent to your email after 3 failed attempts.'
  };

  return (
    <div
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/75 backdrop-blur-md"
    >
      <div className="bg-[var(--bg-card)] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative text-[var(--text-primary)] border border-[var(--text-primary)]/15/80 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition-all"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="mb-5 pr-8">
          <h2 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">{titleMap[tab]}</h2>
          <p className="text-xs text-slate-500 mt-1">{subtitleMap[tab]}</p>
        </div>

        {(tab === 'login' || tab === 'signup') && (
          <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                resetFormFields();
              }}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                tab === 'login' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                resetFormFields();
              }}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                tab === 'signup' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent"
              />
            </div>
          )}

          {(tab === 'login' ||
            tab === 'signup' ||
            tab === 'forgot' ||
            tab === 'reset' ||
            tab === 'otp') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={tab === 'otp' || tab === 'reset'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent disabled:opacity-70"
              />
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent"
              />
            </div>
          )}

          {(tab === 'login' || tab === 'signup') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={tab === 'signup' ? 8 : undefined}
                  placeholder={tab === 'signup' ? 'Exactly 8 chars, mixed case…' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-slate-700 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tab === 'signup' && <PasswordChecklist password={password} />}
            </div>
          )}

          {(tab === 'otp' || tab === 'reset') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent tracking-widest"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500">
                  {resendSeconds > 0 ? (
                    <>
                      Resend available in{' '}
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {formatCountdown(resendSeconds)}
                      </span>
                    </>
                  ) : (
                    'Didn’t get the code?'
                  )}
                </p>
                <button
                  type="button"
                  disabled={resendSeconds > 0 || isResending}
                  onClick={handleResendOtp}
                  className="text-[11px] font-bold text-[var(--accent-warm)] hover:underline disabled:text-[var(--text-muted)] disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResending ? 'Sending…' : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {tab === 'reset' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  maxLength={8}
                  placeholder="Exactly 8 chars, mixed case…"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm border border-[var(--text-primary)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-slate-700 cursor-pointer p-0.5"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordChecklist password={newPassword} />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium bg-red-500/10 border border-red-100 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
          {infoMsg && (
            <p className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {infoMsg}
            </p>
          )}
          {devOtpHint && (
            <p className="text-[11px] text-[var(--accent-amber)] font-mono bg-[var(--bg-surface)] border border-[var(--accent-warm)]/30 rounded-lg px-3 py-2">
              {devOtpHint}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--accent-warm)] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {tab === 'login' && 'Log In'}
            {tab === 'signup' && 'Create Account'}
            {tab === 'forgot' && 'Send OTP'}
            {tab === 'reset' && 'Update Password'}
            {tab === 'otp' && 'Verify OTP & Log In'}
          </button>
        </form>

        {tab === 'login' && (
          <button
            type="button"
            onClick={() => {
              setTab('forgot');
              resetFormFields();
            }}
            className="mt-4 w-full text-center text-xs text-[var(--accent-warm)] font-semibold hover:underline cursor-pointer"
          >
            Forgot password? (Admin / Designer / Client)
          </button>
        )}

        {(tab === 'forgot' || tab === 'reset' || tab === 'otp') && (
          <button
            type="button"
            onClick={() => {
              setTab('login');
              resetFormFields();
            }}
            className="mt-4 w-full text-center text-xs text-slate-500 font-semibold hover:text-slate-800 cursor-pointer"
          >
            ← Back to Log In
          </button>
        )}
      </div>
    </div>
  );
};
