'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AuthForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result =
        mode === 'login'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password, callsign || undefined);
      if (result.error) throw result.error;
      await refresh();
      router.replace('/mode-select');
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
            {mode === 'login' ? 'Login to ORION-9' : 'Register a new operative'}
          </h2>
        </div>
        <Button variant="ghost" size="sm" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Register' : 'Login'}
        </Button>
      </div>

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
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
          />
        </label>

        {mode === 'register' ? (
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Callsign (optional)</span>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
              placeholder="e.g. Operator-Alpha"
            />
          </label>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-100">{error}</p>
        ) : null}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Register'}
        </Button>


      </form>
    </Card>
  );
}
