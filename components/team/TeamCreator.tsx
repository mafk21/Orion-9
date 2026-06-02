'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTeam, joinTeam } from '@/services/teams';
import { TEAM_ROLES, ROLE_LABELS } from '@/types/roles';
import type { TeamRole } from '@/types/database';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';

export default function TeamCreator() {
  const { user, refresh } = useAuth();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [role, setRole] = useState<TeamRole>('captain');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user) { setError('Not authenticated.'); return; }
    setBusy(true);
    setError('');
    try {
      if (mode === 'create') {
        await createTeam(name.trim(), user.id, role);
      } else {
        await joinTeam(joinCode.trim().toUpperCase(), user.id, role);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Form your unit</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Team enrollment</h2>
          <p className="mt-2 text-sm text-slate-300">Membership is permanent. Choose carefully — once you commit, the slot is yours.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === 'create' ? 'primary' : 'ghost'} onClick={() => setMode('create')}>Create</Button>
          <Button size="sm" variant={mode === 'join' ? 'primary' : 'ghost'} onClick={() => setMode('join')}>Join</Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {mode === 'create' ? (
          <>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Team name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none code-text uppercase tracking-wider" placeholder="E.G. OMEGA-9" maxLength={15} />
              <p className="text-[0.62rem] uppercase tracking-[0.25em] text-cyan-200/50">5–15 characters, no spaces, no duplicates</p>
            </label>
          </>
        ) : (
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Join code</span>
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none code-text uppercase tracking-widest text-center text-lg" placeholder="XK9M2P" maxLength={6} />
            <p className="text-[0.62rem] uppercase tracking-[0.25em] text-cyan-200/50">Enter the 6-character code from your team leader</p>
          </label>
        )}

        <div>
          <p className="mb-2 text-[0.72rem] uppercase tracking-[0.3em] text-cyan-300/70">Role</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.22em]',
                  role === r
                    ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                    : 'border-white/10 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-100'
                ].join(' ')}
              >{ROLE_LABELS[r]}</button>
            ))}
          </div>
        </div>

        {error ? (
          <HudFrame tone="rose"><p className="text-sm text-rose-100">{error}</p></HudFrame>
        ) : null}

        <Button onClick={submit} disabled={busy} fullWidth>
          {busy ? 'Working…' : mode === 'create' ? 'Create team' : 'Join team'}
        </Button>
      </div>
    </Card>
  );
}
