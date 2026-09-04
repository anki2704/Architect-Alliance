import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setStoredAuth, ApiError } from '../services/api';
import { User } from '../types';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(email.trim(), password);

      if ('requiresOtp' in result && result.requiresOtp) {
        setOtpRequired(true);
        if (result.devOtp) setDevOtp(result.devOtp);
        setError(result.error || 'OTP required. Check your email.');
        setLoading(false);
        return;
      }

      const { user, token } = result as { user: User; token: string };

      // Only allow admin or designer
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] border border-[var(--text-primary)]/10 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-warm)]/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[var(--accent-warm)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Login</h1>
              <p className="text-xs text-[var(--text-secondary)]">Restricted access</p>
            </div>
          </div>

          {!otpRequired ? (
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
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Enter the OTP sent to <strong>{email}</strong>
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
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpRequired(false);
                  setOtp('');
                  setError('');
                  setDevOtp(null);
                }}
                className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ← Back to login
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
