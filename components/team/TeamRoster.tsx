'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateMemberRole } from '@/services/teams';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TEAM_ROLES, ROLE_LABELS } from '@/types/roles';
import type { TeamWithMembers } from '@/types/team';
import type { TeamRole } from '@/types/database';

export default function TeamRoster({ team }: { team: TeamWithMembers }) {
  const { user, refresh } = useAuth();
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isLeader = team.created_by === user?.id;

  async function handleRoleChange(memberUserId: string, currentRole: TeamRole, newRole: TeamRole) {
    if (!user || newRole === currentRole) return;
    setBusyMemberId(memberUserId);
    setError('');
    try {
      await updateMemberRole(team.id, memberUserId, newRole, user.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setBusyMemberId(null);
    }
  }

  return (
    <Card className="p-6 md:p-8">
      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Roster · {team.name}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Crew assignments</h3>
      {isLeader ? (
        <p className="mt-1 text-xs text-amber-200/70 code-text uppercase tracking-[0.25em]">Leader · you can assign roles</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
      <ul className="mt-5 space-y-3">
        {team.members.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-cyan-400/20 bg-space-950/60 p-4 text-sm text-slate-300">No assignments yet.</li>
        ) : (
          team.members.map((m) => {
            const isLeaderOf = team.created_by === m.user_id;
            return (
              <li key={m.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-space-950/70 p-4 text-sm text-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base text-white">{m.profile?.callsign ?? m.profile?.email ?? m.user_id.slice(0, 8)}</p>
                    {isLeaderOf ? <Badge tone="warning">LEADER</Badge> : null}
                  </div>
                  <p className="text-xs text-slate-400 code-text">{m.user_id.slice(0, 8)}…</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLeader && !isLeaderOf ? (
                    <div className="flex flex-wrap gap-1">
                      {TEAM_ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          disabled={busyMemberId === m.user_id}
                          onClick={() => handleRoleChange(m.user_id, m.role, r)}
                          className={[
                            'rounded-full px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] transition border',
                            m.role === r
                              ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
                              : 'border-white/10 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-100'
                          ].join(' ')}
                        >{ROLE_LABELS[r]}</button>
                      ))}
                    </div>
                  ) : (
                    <Badge tone="info">{ROLE_LABELS[m.role]}</Badge>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
