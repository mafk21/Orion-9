'use client';

import { useEffect, useState } from 'react';
import { fetchTopProfiles } from '@/services/profile';
import { fetchAllTeams } from '@/services/teams';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import Badge from '@/components/ui/Badge';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import type { ProfileRow, TeamRow } from '@/types/database';

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, t] = await Promise.all([fetchTopProfiles(50), fetchAllTeams()]);
      if (!active) return;
      setProfiles(p);
      setTeams(t);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Standings</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Operative & team leaderboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">XP ranks reflect mission resolution, signal recovery, and lore extraction across all phases.</p>
      </HudFrame>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <SectionHeader title="Operatives" subtitle="By XP" />
          <ol className="mt-5 space-y-3">
            {profiles.length === 0 ? (
              <li className="text-sm text-slate-400">No operatives ranked yet.</li>
            ) : profiles.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-space-950/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="code-text text-[0.7rem] uppercase tracking-[0.32em] text-cyan-200/80 w-8">#{i + 1}</span>
                  <div>
                    <p className="text-base text-white">{p.callsign ?? p.email}</p>
                    <p className="code-text text-[0.62rem] uppercase tracking-[0.3em] text-slate-500">{p.clearance_level}</p>
                  </div>
                </div>
                <strong className="text-xl text-cyan-100">{p.xp.toLocaleString()} XP</strong>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Teams" subtitle="By phase progress" />
          <ol className="mt-5 space-y-3">
            {teams.length === 0 ? (
              <li className="text-sm text-slate-400">No teams formed.</li>
            ) : teams.sort((a, b) => b.phase - a.phase || a.attempt_count - b.attempt_count).map((t, i) => (
              <li key={t.id} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base text-white">#{i + 1} · {t.name}</p>
                    <p className="code-text text-[0.62rem] uppercase tracking-[0.3em] text-slate-500">Phase {t.phase} / 4</p>
                  </div>
                  <Badge tone={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'danger' : 'info'}>{t.status}</Badge>
                </div>
                <div className="mt-3"><AttemptIndicator team={t} /></div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
