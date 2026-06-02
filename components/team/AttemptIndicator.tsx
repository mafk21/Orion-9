import AttemptDots from '@/components/ui/AttemptDots';
import Badge from '@/components/ui/Badge';
import { MAX_ATTEMPTS } from '@/types/team';
import type { TeamRow } from '@/types/database';

export default function AttemptIndicator({ team }: { team: TeamRow }) {
  const tone =
    team.status === 'failed' ? 'danger' : team.status === 'completed' ? 'success' : 'info';
  const remaining = Math.max(0, MAX_ATTEMPTS - team.attempt_count);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AttemptDots used={team.attempt_count} total={MAX_ATTEMPTS} />
      <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-cyan-100/80">
        {team.attempt_count} / {MAX_ATTEMPTS} failures · {remaining} left
      </span>
      <Badge tone={tone}>{team.status.toUpperCase()}</Badge>
      {team.locked ? <Badge tone="warning">LOCKED</Badge> : null}
    </div>
  );
}
