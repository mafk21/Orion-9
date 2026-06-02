'use client';

import { useEffect, useState } from 'react';
import { fetchPublicSignals } from '@/services/signals';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import SignalCard from '@/components/signals/SignalCard';
import SignalWave from '@/components/ui/SignalWave';
import type { SignalRow } from '@/types/database';

export default function SoloSignalsPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);

  useEffect(() => {
    let active = true;
    fetchPublicSignals().then((s) => active && setSignals(s));
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="violet">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Solo signals</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Public signal archive</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Signals broadcast outside team channels. Some are decoys, some are critical.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SignalWave label="Open carrier" />
          <SignalWave label="Background hum" />
        </div>
      </HudFrame>

      <Card className="p-6">
        <SectionHeader title="Public transmissions" subtitle="No team binding" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {signals.length === 0 ? (
            <p className="text-sm text-slate-400 col-span-full">No public signals received.</p>
          ) : signals.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      </Card>
    </div>
  );
}
