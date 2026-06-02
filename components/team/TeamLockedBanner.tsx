import HudFrame from '@/components/ui/HudFrame';
import type { TeamRow } from '@/types/database';

export default function TeamLockedBanner({ team }: { team: TeamRow }) {
  if (team.status === 'active') return null;

  if (team.status === 'completed') {
    return (
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Sequence complete</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">ORION-9 secured.</h3>
        <p className="mt-2 text-sm text-slate-300">Your team reconstructed the access vector and exposed the compromiser. The investigation is closed.</p>
      </HudFrame>
    );
  }

  return (
    <HudFrame tone="rose">
      <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-rose-200/90">Permanent lockout</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Team {team.name} is sealed.</h3>
      <p className="mt-2 text-sm text-slate-300">All three attempts have been consumed. ASTRA has classified this team as compromised. Membership is closed and progress is final.</p>
    </HudFrame>
  );
}
