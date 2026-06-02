import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SignalWave from '@/components/ui/SignalWave';
import { SIGNAL_STATUS_LABELS } from '@/types/signal';
import { isLikelyFabricated } from '@/lib/astra';
import type { SignalRow } from '@/types/database';

const statusTone = {
  received: 'info',
  decoded: 'warning',
  resolved: 'success'
} as const;

export default function SignalCard({ signal }: { signal: SignalRow }) {
  const fabricated = isLikelyFabricated(signal);
  return (
    <Card className={['p-5', fabricated ? 'warning-glow' : ''].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="code-text text-[0.62rem] uppercase tracking-[0.32em] text-cyan-300/70">
            Signal · {new Date(signal.created_at).toLocaleString()}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{signal.title}</h3>
        </div>
        <Badge tone={statusTone[signal.status]}>{SIGNAL_STATUS_LABELS[signal.status]}</Badge>
      </div>

      <div className="mt-4"><SignalWave label={fabricated ? 'Suspect waveform' : 'Carrier waveform'} /></div>

      {signal.data?.transcript ? (
        <p className="mt-4 rounded-xl border border-white/8 bg-space-950/60 p-3 text-sm leading-6 text-slate-200 code-text">{signal.data.transcript as string}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
        <span>Origin · {(signal.data?.origin as string | undefined) ?? 'unknown'}</span>
        {fabricated ? <Badge tone="warning">Authenticity: suspect</Badge> : <Badge tone="info">Authenticity: nominal</Badge>}
      </div>
    </Card>
  );
}
