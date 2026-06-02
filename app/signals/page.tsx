'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSignalsForTeam, fetchPublicSignals } from '@/services/signals';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import SignalWave from '@/components/ui/SignalWave';
import SignalCard from '@/components/signals/SignalCard';
import AstraFeed from '@/components/story/AstraFeed';
import { SIGNAL_STATUS_ORDER, SIGNAL_STATUS_LABELS } from '@/types/signal';
import type { SignalRow, SignalStatus } from '@/types/database';

export default function SignalsPage() {
  const { team } = useAuth();
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [filter, setFilter] = useState<SignalStatus | 'all'>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      const data = team ? await fetchSignalsForTeam(team.id) : await fetchPublicSignals();
      if (active) setSignals(data);
    })();
    return () => { active = false; };
  }, [team?.id]);

  const filtered = useMemo(
    () => (filter === 'all' ? signals : signals.filter((s) => s.status === filter)),
    [signals, filter]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="violet">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Signal core</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Inbound transmissions</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Signals are classified and routed through three states: RECEIVED → DECODED → RESOLVED. Some transmissions may be deceptive or false.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SignalWave label="Carrier · alpha" />
          <SignalWave label="Carrier · beta" />
          <SignalWave label="Carrier · gamma" />
        </div>
      </HudFrame>

      {team ? <AstraFeed phase={team.phase} /> : null}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader title="Signal feed" subtitle="Filter by state" />
          <div className="flex flex-wrap gap-2">
            {(['all', ...SIGNAL_STATUS_ORDER] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={[
                  'rounded-full px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] transition border',
                  filter === s
                    ? 'border-violet-400/40 bg-violet-400/10 text-violet-100'
                    : 'border-white/10 text-slate-300 hover:border-violet-400/30'
                ].join(' ')}
              >
                {s === 'all' ? 'All' : SIGNAL_STATUS_LABELS[s as SignalStatus]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400">No signals to display.</p>
          ) : filtered.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      </Card>
    </div>
  );
}
