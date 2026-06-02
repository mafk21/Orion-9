import HudFrame from '@/components/ui/HudFrame';
import { ASTRA_VOICE, astraInfluenceForPhase } from '@/lib/astra';
import type { Phase } from '@/types/database';

export default function AstraFeed({ phase }: { phase: Phase }) {
  const lines = ASTRA_VOICE.filter((l) => l.phase === phase);
  const influence = astraInfluenceForPhase(phase);

  // If no admin-configured voice lines, don't render (system starts empty per spec)
  if (lines.length === 0) {
    return null;
  }

  return (
    <HudFrame tone={phase === 4 ? 'rose' : phase === 3 ? 'amber' : 'violet'}>
      <div className="flex items-center justify-between">
        <p className="code-text text-[0.7rem] uppercase tracking-[0.32em] text-violet-200/80">System voice · phase {phase} · {influence}</p>
        <span className="hud-pulse inline-block h-2 w-2 rounded-full bg-violet-300" />
      </div>
      <ul className="mt-3 space-y-2 code-text text-sm text-violet-100">
        {lines.map((l) => (
          <li key={l.id} className="rounded-xl border border-violet-400/15 bg-violet-400/5 p-3">
            <span className="mr-2 text-[0.62rem] uppercase tracking-[0.3em] text-violet-200/70">[{l.intent}]</span>
            {l.body}
          </li>
        ))}
      </ul>
    </HudFrame>
  );
}
