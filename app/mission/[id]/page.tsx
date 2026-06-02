'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMission } from '@/services/missions';
import { fetchSignalsForTeam } from '@/services/signals';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import Badge from '@/components/ui/Badge';
import SectionHeader from '@/components/ui/SectionHeader';
import MissionAttemptPanel from '@/components/missions/MissionAttemptPanel';
import SignalCard from '@/components/signals/SignalCard';
import TeamLockedBanner from '@/components/team/TeamLockedBanner';
import { PHASE_LABELS } from '@/types/mission';
import type { MissionRow, SignalRow } from '@/types/database';

export default function MissionDetailPage() {
  const params = useParams<{ id: string }>();
  const { team, membership } = useAuth();
  const [mission, setMission] = useState<MissionRow | null>(null);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    let active = true;
    (async () => {
      const m = await fetchMission(params.id);
      if (!active) return;
      setMission(m);
      setLoading(false);
      if (m && team) {
        const allSig = await fetchSignalsForTeam(team.id);
        if (active) setSignals(allSig.filter((s) => s.linked_mission_id === m.id));
      }
    })();
    return () => { active = false; };
  }, [params?.id, team?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <p className="code-text text-xs uppercase tracking-[0.35em] text-cyan-200/80 hud-pulse">Loading mission…</p>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <HudFrame tone="rose">
          <h1 className="text-2xl font-semibold text-white">Mission not found.</h1>
          <Link href="/missions" className="mt-4 inline-flex rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-rose-100">Back to board</Link>
        </HudFrame>
      </div>
    );
  }

  const briefing = mission.payload?.briefing as string | undefined;
  const objectives = (mission.payload?.objectives as Array<{ id: string; label: string; complete?: boolean }> | undefined) ?? [];
  const clues = (mission.payload?.clues as string[] | undefined) ?? [];
  const timeline = (mission.payload?.timeline as Array<{ at: string; entry: string }> | undefined) ?? [];

  const statusTone = mission.status === 'active' ? 'info' : mission.status === 'completed' ? 'success' : 'danger';

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      {team ? <TeamLockedBanner team={team} /> : null}

      <HudFrame tone="cyan">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="code-text text-[0.7rem] uppercase tracking-[0.35em] text-cyan-200/80">{PHASE_LABELS[mission.phase]}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{mission.title}</h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">{briefing ?? 'No briefing on file.'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={statusTone}>{mission.status.toUpperCase()}</Badge>
            <span className="code-text text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">Difficulty · {mission.difficulty}</span>
          </div>
        </div>
      </HudFrame>

      {team && membership ? (
        <MissionAttemptPanel mission={mission} team={team} role={membership.role} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <SectionHeader title="Objectives" subtitle="Resolution checklist" />
          <ul className="mt-5 space-y-2">
            {objectives.length === 0 ? (
              <li className="text-sm text-slate-400">No objectives recorded for this mission.</li>
            ) : objectives.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-space-950/70 px-3 py-2 text-sm">
                <span className={[
                  'inline-block h-2.5 w-2.5 rounded-full',
                  o.complete ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'border border-cyan-400/40'
                ].join(' ')} />
                <span className={o.complete ? 'text-emerald-100 line-through' : 'text-slate-200'}>{o.label}</span>
              </li>
            ))}
          </ul>

          {clues.length > 0 ? (
            <div className="mt-6">
              <p className="code-text text-[0.7rem] uppercase tracking-[0.32em] text-violet-200/80">Clues recovered</p>
              <ul className="mt-3 space-y-2 text-sm">
                {clues.map((c, i) => (
                  <li key={i} className="rounded-xl border border-violet-400/15 bg-violet-400/5 p-3 text-violet-100">{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <SectionHeader title="Timeline" subtitle="Recorded events" />
          <ol className="mt-5 space-y-3 code-text text-sm">
            {timeline.length === 0 ? (
              <li className="text-sm text-slate-400">No timeline events.</li>
            ) : timeline.map((t, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-white/6 bg-space-950/70 px-3 py-2">
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 w-32">{t.at}</span>
                <span className="text-cyan-100 flex-1">{t.entry}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {signals.length > 0 ? (
        <section>
          <SectionHeader title="Linked signals" subtitle="Transmissions tied to this mission" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
