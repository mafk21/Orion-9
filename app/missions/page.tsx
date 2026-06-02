'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMissionsForTeam } from '@/services/missions';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import MissionCard from '@/components/missions/MissionCard';
import TeamLockedBanner from '@/components/team/TeamLockedBanner';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import { PHASE_LABELS } from '@/types/mission';
import type { MissionRow, Phase } from '@/types/database';

const PHASES: Phase[] = [1, 2, 3, 4];

export default function MissionsPage() {
  const { team, membership } = useAuth();
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  useEffect(() => {
    if (!team) return;
    let active = true;
    fetchMissionsForTeam(team.id).then((m) => active && setMissions(m));
    return () => { active = false; };
  }, [team?.id]);

  if (!team || !membership) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <HudFrame tone="amber">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-amber-200/80">Team required</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">No team membership detected.</h1>
          <p className="mt-3 text-sm text-slate-300">Form a unit before accessing mission objectives.</p>
          <Link href="/crew/team" className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-amber-100">Form team</Link>
        </HudFrame>
      </div>
    );
  }

  const filtered = filter === 'all' ? missions : missions.filter((m) => m.status === filter);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <TeamLockedBanner team={team} />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader title="Mission board" subtitle="Phase-driven objectives" />
          <AttemptIndicator team={team} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'rounded-full px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] transition border',
                filter === f
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                  : 'border-white/10 text-slate-300 hover:border-cyan-400/30'
              ].join(' ')}
            >{f}</button>
          ))}
        </div>
      </Card>

      {PHASES.map((p) => {
        const inPhase = filtered.filter((m) => m.phase === p);
        if (inPhase.length === 0 && filter !== 'all') return null;
        return (
          <section key={p} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="code-text text-sm uppercase tracking-[0.32em] text-cyan-200/80">{PHASE_LABELS[p]}</h2>
              {p === team.phase ? <span className="code-text text-[0.62rem] uppercase tracking-[0.3em] text-amber-200/80 hud-pulse">CURRENT</span> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inPhase.length === 0 ? (
                <p className="col-span-full text-sm text-slate-400">No missions in this phase.</p>
              ) : inPhase.map((m) => <MissionCard key={m.id} mission={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
