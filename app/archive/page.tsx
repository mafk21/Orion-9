'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSignalsForTeam, fetchPublicSignals } from '@/services/signals';
import { fetchLogsForTeam } from '@/services/logs';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import SignalCard from '@/components/signals/SignalCard';
import SystemLogFeed from '@/components/story/SystemLogFeed';
import type { SignalRow, SystemLogRow } from '@/types/database';

export default function ArchivePage() {
  const { team } = useAuth();
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [logs, setLogs] = useState<SystemLogRow[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const sig = team ? await fetchSignalsForTeam(team.id) : await fetchPublicSignals();
      const log = await fetchLogsForTeam(team?.id ?? null);
      if (!active) return;
      setSignals(sig.filter((s) => s.status === 'resolved'));
      setLogs(log);
    })();
    return () => { active = false; };
  }, [team?.id]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Archive</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Resolved transmissions & telemetry</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Closed signals, finalized logs, and recovered context. Preserved as evidence for the investigation.
        </p>
      </HudFrame>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <SectionHeader title="Resolved signals" subtitle="Closed transmissions" />
          <div className="mt-5 space-y-4">
            {signals.length === 0 ? (
              <p className="text-sm text-slate-400">No resolved signals on file.</p>
            ) : signals.map((s) => <SignalCard key={s.id} signal={s} />)}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Telemetry archive" subtitle="All system logs" />
          <div className="mt-5"><SystemLogFeed logs={logs} /></div>
        </Card>
      </div>
    </div>
  );
}
