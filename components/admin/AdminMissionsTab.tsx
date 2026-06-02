'use client';

import { useEffect, useState } from 'react';
import { fetchAllMissions, createMission, deleteMission, updateMission } from '@/services/missions';
import { fetchAllTeams } from '@/services/teams';
import { logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { MissionRow, TeamRow, Phase } from '@/types/database';

export default function AdminMissionsTab() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<Phase>(1);
  const [teamId, setTeamId] = useState<string>('');
  const [briefing, setBriefing] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    const [m, t] = await Promise.all([fetchAllMissions(), fetchAllTeams()]);
    setMissions(m);
    setTeams(t);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!user) return;
    setBusy(true); setErr('');
    try {
      const m = await createMission({
        team_id: teamId || null,
        title,
        phase,
        payload: briefing ? { briefing } : {}
      });
      await logAdminAction({ admin_id: user.id, action: 'mission.create', target_type: 'mission', target_id: m.id, metadata: { title, phase } });
      setTitle(''); setBriefing('');
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed.'); } finally { setBusy(false); }
  }

  async function changeStatus(m: MissionRow, status: MissionRow['status']) {
    if (!user) return;
    await updateMission(m.id, { status });
    await logAdminAction({ admin_id: user.id, action: 'mission.set_status', target_type: 'mission', target_id: m.id, metadata: { status } });
    await load();
  }

  async function remove(m: MissionRow) {
    if (!user) return;
    await deleteMission(m.id);
    await logAdminAction({ admin_id: user.id, action: 'mission.delete', target_type: 'mission', target_id: m.id });
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Create mission</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none" rows={3} placeholder="Briefing" value={briefing} onChange={(e) => setBriefing(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" value={phase} onChange={(e) => setPhase(Number(e.target.value) as Phase)}>
              {[1, 2, 3, 4].map((p) => <option key={p} value={p}>Phase {p}</option>)}
            </select>
            <select className="rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">No team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          {err ? <p className="text-sm text-rose-200">{err}</p> : null}
          <Button onClick={create} disabled={busy || !title}>Create</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white">Existing missions</h3>
        <ul className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {missions.map((m) => (
            <li key={m.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base text-white">{m.title}</p>
                  <p className="code-text text-[0.65rem] uppercase tracking-[0.28em] text-cyan-200/70">P{m.phase} · diff {m.difficulty} · team {m.team_id?.slice(0, 8) ?? 'none'}</p>
                </div>
                <Badge tone={m.status === 'active' ? 'info' : m.status === 'completed' ? 'success' : 'danger'}>{m.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => changeStatus(m, 'active')}>Active</Button>
                <Button size="sm" variant="primary" onClick={() => changeStatus(m, 'completed')}>Complete</Button>
                <Button size="sm" variant="danger" onClick={() => changeStatus(m, 'failed')}>Fail</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(m)}>Delete</Button>
              </div>
            </li>
          ))}
          {missions.length === 0 ? <li className="text-sm text-slate-400">No missions yet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
