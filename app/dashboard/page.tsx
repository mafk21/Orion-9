'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMissionsForTeam } from '@/services/missions';
import { fetchSignalsForTeam } from '@/services/signals';
import { fetchLogsForTeam } from '@/services/logs';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import SectionHeader from '@/components/ui/SectionHeader';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import TeamLockedBanner from '@/components/team/TeamLockedBanner';
import AstraFeed from '@/components/story/AstraFeed';
import SystemLogFeed from '@/components/story/SystemLogFeed';
import SignalCard from '@/components/signals/SignalCard';
import MissionCard from '@/components/missions/MissionCard';
import { PHASE_LABELS, PHASE_DESCRIPTIONS } from '@/types/mission';
import type { MissionRow, SignalRow, SystemLogRow } from '@/types/database';

export default function DashboardPage() {
  const { user, profile, team, membership } = useAuth();
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [logs, setLogs] = useState<SystemLogRow[]>([]);

  useEffect(() => {
    if (!team) return;
    let active = true;
    (async () => {
      const [m, s, l] = await Promise.all([
        fetchMissionsForTeam(team.id),
        fetchSignalsForTeam(team.id),
        fetchLogsForTeam(team.id)
      ]);
      if (!active) return;
      setMissions(m);
      setSignals(s);
      setLogs(l);
    })();
    return () => { active = false; };
  }, [team?.id]);

  if (!user) return null;

  if (!team || !membership) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
        <HudFrame tone="violet">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Onboarding</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {profile?.callsign ?? 'operative'}.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Form a team or join one to begin the ORION-9 investigation. Solo operatives may continue through the lore archive.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/crew/team" className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-cyan-100 hover:bg-cyan-400/15">
              Form team
            </Link>
            <Link href="/solo" className="rounded-full border border-violet-400/30 bg-violet-400/10 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-violet-100 hover:bg-violet-400/15">
              Continue solo
            </Link>
          </div>
        </HudFrame>
      </div>
    );
  }

  const phaseProgress = Math.round(((team.phase - 1) / 3) * 100);
  const activeMissions = missions.filter((m) => m.status === 'active');
  const recentSignals = signals.slice(0, 3);
  const recentLogs = logs.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <TeamLockedBanner team={team} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <HudFrame tone="cyan">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="code-text text-[0.7rem] uppercase tracking-[0.35em] text-cyan-200/80">{PHASE_LABELS[team.phase]}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Team {team.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">{PHASE_DESCRIPTIONS[team.phase]}</p>
            </div>
            <div className="flex flex-col gap-3">
              <AttemptIndicator team={team} />
              <Badge tone="info">Role · {membership.role.toUpperCase()}</Badge>
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={phaseProgress} label={`Phase progression · ${team.phase}/4`} />
          </div>
        </HudFrame>

        <Card className="p-6">
          <SectionHeader title="Active duty" subtitle="Mission queue" />
          <ul className="mt-5 space-y-2">
            <li className="flex justify-between text-sm text-slate-300">
              <span>Active missions</span><strong className="text-cyan-100">{activeMissions.length}</strong>
            </li>
            <li className="flex justify-between text-sm text-slate-300">
              <span>Resolved signals</span>
              <strong className="text-cyan-100">{signals.filter((s) => s.status === 'resolved').length}</strong>
            </li>
            <li className="flex justify-between text-sm text-slate-300">
              <span>Logged transmissions</span><strong className="text-cyan-100">{logs.length}</strong>
            </li>
            <li className="flex justify-between text-sm text-slate-300">
              <span>Operative XP</span><strong className="text-cyan-100">{profile?.xp ?? 0}</strong>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/missions" className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-cyan-100 hover:bg-cyan-400/15">Missions</Link>
            <Link href="/signals" className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-violet-100 hover:bg-violet-400/15">Signals</Link>
            <Link href="/crew" className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-slate-100 hover:bg-white/10">Crew</Link>
            {team.phase === 4 ? (
              <Link href="/endgame" className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-rose-100 hover:bg-rose-400/15">Sealed chamber</Link>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <AstraFeed phase={team.phase} />
        <Card className="p-6">
          <SectionHeader title="Telemetry" subtitle="Recent system logs" />
          <div className="mt-5"><SystemLogFeed logs={recentLogs} /></div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <SectionHeader title="Active missions" subtitle="Briefings open for resolution" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {activeMissions.length === 0 ? (
              <p className="text-sm text-slate-400">No active missions assigned. Visit the Missions board.</p>
            ) : activeMissions.slice(0, 4).map((m) => <MissionCard key={m.id} mission={m} />)}
          </div>
        </Card>
        <Card className="p-6">
          <SectionHeader title="Latest signals" subtitle="Inbound transmissions" />
          <div className="mt-5 space-y-4">
            {recentSignals.length === 0 ? (
              <p className="text-sm text-slate-400">No signals received.</p>
            ) : recentSignals.map((s) => <SignalCard key={s.id} signal={s} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}
