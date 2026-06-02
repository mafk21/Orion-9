'use client';

import { useEffect, useState } from 'react';
import { fetchSoloChallenges, createSoloChallenge, updateSoloChallenge, deleteSoloChallenge } from '@/services/solo';
import { logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { SoloChallengeRow } from '@/types/database';

export default function AdminSoloTab() {
  const { user } = useAuth();
  const [list, setList] = useState<SoloChallengeRow[]>([]);
  const [title, setTitle] = useState('');
  const [clue, setClue] = useState('');
  const [fragment, setFragment] = useState('');
  const [hint, setHint] = useState('');
  const [phase, setPhase] = useState<number | ''>('');

  async function load() { setList(await fetchSoloChallenges()); }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!user || !title) return;
    const c = await createSoloChallenge({
      title,
      clue,
      code_fragment: fragment || undefined,
      lore_hint: hint || undefined,
      phase: phase === '' ? null : Number(phase)
    });
    await logAdminAction({ admin_id: user.id, action: 'solo.create', target_type: 'solo_challenge', target_id: c.id });
    setTitle(''); setClue(''); setFragment(''); setHint(''); setPhase('');
    await load();
  }

  async function remove(c: SoloChallengeRow) {
    if (!user) return;
    await deleteSoloChallenge(c.id);
    await logAdminAction({ admin_id: user.id, action: 'solo.delete', target_type: 'solo_challenge', target_id: c.id });
    await load();
  }

  async function patch(c: SoloChallengeRow, key: keyof SoloChallengeRow, value: string) {
    if (!user) return;
    await updateSoloChallenge(c.id, { [key]: value } as Partial<SoloChallengeRow>);
    await logAdminAction({ admin_id: user.id, action: 'solo.update', target_type: 'solo_challenge', target_id: c.id, metadata: { [key]: value } });
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Create challenge</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" rows={3} placeholder="Clue (indirect, no spoiler)" value={clue} onChange={(e) => setClue(e.target.value)} />
          <input className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 code-text" placeholder="Code fragment (e.g. E19)" value={fragment} onChange={(e) => setFragment(e.target.value)} />
          <textarea className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" rows={2} placeholder="Lore hint" value={hint} onChange={(e) => setHint(e.target.value)} />
          <select className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" value={phase} onChange={(e) => setPhase(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">No phase</option>
            {[1, 2, 3, 4].map((p) => <option key={p} value={p}>Phase {p}</option>)}
          </select>
          <Button onClick={create} disabled={!title}>Create</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Existing challenges</h3>
        <ul className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {list.map((c) => (
            <li key={c.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4 space-y-2">
              <p className="text-base text-white">{c.title}</p>
              <p className="text-sm text-slate-300">{c.clue}</p>
              <p className="code-text text-[0.65rem] uppercase tracking-[0.28em] text-cyan-200/70">P{c.phase ?? '–'} · {c.code_fragment ?? '—'}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => patch(c, 'lore_hint', prompt('Lore hint', c.lore_hint ?? '') ?? c.lore_hint ?? '')}>Edit hint</Button>
                <Button size="sm" variant="danger" onClick={() => remove(c)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
