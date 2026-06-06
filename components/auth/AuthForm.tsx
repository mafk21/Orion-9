'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, resetPassword } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if we're in password reset mode
  const isResetMode = searchParams.get('reset') === 'true';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation for registration
    if (mode === 'register') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(callsign || '')) {
        setError('Callsign can only contain letters, numbers, and underscores.');
        setLoading(false);
        return;
      }
    }

    try {
      if (showReset || isResetMode) {
        // Password reset flow
        const result = await resetPassword(email);
        if (result.error) throw result.error;
        setSuccess('Password reset email sent! Check your inbox.');
        setShowReset(false);
      } else {
        const result =
          mode === 'login'
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password, callsign || undefined);
        if (result.error) throw result.error;
        await refresh();
        router.replace('/mode-select');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Secure access</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {showReset || isResetMode 
              ? 'Reset your password' 
              : mode === 'login' 
                ? 'Login to ORION-9' 
                : 'Register a new operative'}
          </h2>
        </div>
        {!showReset && !isResetMode && (
          <Button variant="ghost" size="sm" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register' : 'Login'}
          </Button>
        )}
      </div>

      {(showReset || isResetMode) ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
              placeholder="Enter your email address"
            />
          </label>
          <p className="text-xs text-slate-400">
            We'll send you a link to reset your password.
          </p>
          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">{success}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <Button type="button" disabled={loading} variant="ghost" onClick={() => { setShowReset(false); setMode('login'); }}>
              Back to login
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-cyan-400/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </label>

          {mode === 'register' ? (
            <>
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Confirm Password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Callsign (optional)</span>
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
                  placeholder="e.g. Operator_Alpha"
                />
              </label>
            </>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">{success}</p>
          ) : null}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Register'}
          </Button>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="w-full text-center text-xs text-cyan-300/70 hover:text-cyan-200 transition"
            >
              Forgot password?
            </button>
          )}
        </form>
      )}
    </Card>
  );
}
