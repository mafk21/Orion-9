import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PHASE_LABELS } from '@/types/mission';
import type { MissionRow } from '@/types/database';

const statusTone = {
  active: 'info',
  completed: 'success',
  failed: 'danger'
} as const;

export default function MissionCard({ mission }: { mission: MissionRow }) {
  return (
    <Link href={`/mission/${mission.id}`} className="group block">
      <Card className="p-5 transition group-hover:border-cyan-400/30 group-hover:shadow-[0_0_28px_rgba(56,189,248,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="code-text text-[0.62rem] uppercase tracking-[0.32em] text-cyan-300/70">{PHASE_LABELS[mission.phase]}</p>
            <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-cyan-100">{mission.title}</h3>
          </div>
          <Badge tone={statusTone[mission.status]}>{mission.status.toUpperCase()}</Badge>
        </div>
        {mission.payload?.briefing ? (
          <p className="mt-3 line-clamp-3 text-sm text-slate-300">{mission.payload.briefing}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
          <span>Difficulty · {mission.difficulty}</span>
          <span className="code-text">{new Date(mission.created_at).toLocaleDateString()}</span>
        </div>
      </Card>
    </Link>
  );
}
