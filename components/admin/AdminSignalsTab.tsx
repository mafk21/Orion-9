'use client';

import { useEffect, useState } from 'react';
import { fetchAllSignals, injectSignal, deleteSignal, advanceSignalStatus } from '@/services/signals';
import { fetchAllTeams } from '@/services/teams';
import { logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { SignalRow, TeamRow, SignalStatus } from '@/types/database';

export default function AdminSignalsTab() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [authenticity, setAuthenticity] = useState<'verified' | 'suspect' | 'fabricated'>('verified');
  const [teamId, setTeamId] = useState('');

  async function load() {
    const [s, t] = await Promise.all([fetchAllSignals(), fetchAllTeams()]);
    setSignals(s); setTeams(t);
  }
  useEffect(() => { load(); }, []);

  async function inject() {
    if (!user || !title) return;
    const s = await injectSignal({
      title,
      team_id: teamId || null,
      data: { transcript, authenticity }
    });
    await logAdminAction({ admin_id: user.id, action: 'signal.inject', target_type: 'signal', target_id: s.id, metadata: { authenticity } });
    setTitle(''); setTranscript('');
    await load();
  }

  async function bump(s: SignalRow, status: SignalStatus) {
    if (!user) return;
    await advanceSignalStatus(s.id, status);
    await logAdminAction({ admin_id: user.id, action: 'signal.update', target_type: 'signal', target_id: s.id, metadata: { status } });
    await load();
  }

  async function remove(s: SignalRow) {
    if (!user) return;
    await deleteSignal(s.id);
    await logAdminAction({ admin_id: user.id, action: 'signal.delete', target_type: 'signal', target_id: s.id });
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Inject signal</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" rows={3} placeholder="Transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          <select className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" value={authenticity} onChange={(e) => setAuthenticity(e.target.value as typeof authenticity)}>
            <option value="verified">verified</option>
            <option value="suspect">suspect</option>
            <option value="fabricated">fabricated</option>
          </select>
          <select className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Public (no team)</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Button onClick={inject} disabled={!title}>Inject</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Existing signals</h3>
        <ul className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {signals.map((s) => (
            <li key={s.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base text-white">{s.title}</p>
                  <p className="code-text text-[0.62rem] uppercase tracking-[0.3em] text-cyan-200/70">{s.team_id ? s.team_id.slice(0, 8) + '…' : 'public'}</p>
                </div>
                <Badge tone={s.status === 'received' ? 'info' : s.status === 'decoded' ? 'warning' : 'success'}>{s.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => bump(s, 'received')}>Received</Button>
                <Button size="sm" variant="secondary" onClick={() => bump(s, 'decoded')}>Decoded</Button>
                <Button size="sm" variant="primary" onClick={() => bump(s, 'resolved')}>Resolved</Button>
                <Button size="sm" variant="danger" onClick={() => remove(s)}>Delete</Button>
              </div>
            </li>
          ))}
          {signals.length === 0 ? <li className="text-sm text-slate-400">No signals.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
