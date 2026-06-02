'use client';

import { useEffect, useState } from 'react';
import { fetchAllTeams, lockTeam, resetAttemptCount, setTeamStatus } from '@/services/teams';
import { logAdminAction } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import type { TeamRow } from '@/types/database';

export default function AdminTeamsTab() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamRow[]>([]);

  async function load() { setTeams(await fetchAllTeams()); }
  useEffect(() => { load(); }, []);

  async function toggleLock(t: TeamRow) {
    if (!user) return;
    await lockTeam(t.id, !t.locked);
    await logAdminAction({ admin_id: user.id, action: t.locked ? 'team.unlock' : 'team.lock', target_type: 'team', target_id: t.id });
    await load();
  }

  async function reset(t: TeamRow) {
    if (!user) return;
    await resetAttemptCount(t.id);
    await logAdminAction({ admin_id: user.id, action: 'team.reset_attempts', target_type: 'team', target_id: t.id });
    await load();
  }

  async function fail(t: TeamRow) {
    if (!user) return;
    await setTeamStatus(t.id, 'failed');
    await logAdminAction({ admin_id: user.id, action: 'team.fail', target_type: 'team', target_id: t.id });
    await load();
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white">Active teams</h3>
      <ul className="mt-4 space-y-3">
        {teams.map((t) => (
          <li key={t.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base text-white">{t.name}</p>
                <p className="code-text text-[0.62rem] uppercase tracking-[0.3em] text-cyan-200/70">{t.id.slice(0, 12)}… · phase {t.phase}</p>
              </div>
              <AttemptIndicator team={t} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => toggleLock(t)}>{t.locked ? 'Unlock' : 'Lock'}</Button>
              <Button size="sm" variant="ghost" onClick={() => reset(t)}>Reset attempts</Button>
              <Button size="sm" variant="danger" onClick={() => fail(t)}>Force fail</Button>
            </div>
          </li>
        ))}
        {teams.length === 0 ? <li className="text-sm text-slate-400">No teams.</li> : null}
      </ul>
    </Card>
  );
}
