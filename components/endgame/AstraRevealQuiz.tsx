'use client';

/**
 * DEPRECATED: Use EndgameRevealQuiz instead.
 * This component is kept for backward compatibility but should not be used in new code.
 * The endgame reveal system is now fully configurable via the game_config table.
 */

import { ASTRA_REVEAL_OPTIONS, isAstraReveal } from '@/lib/astra';
import HudFrame from '@/components/ui/HudFrame';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function AstraRevealQuiz({ onAnswer, busy = false }: { onAnswer: (correct: boolean) => void | Promise<void>; busy?: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <HudFrame tone="rose">
      <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-rose-200/80">Final verification</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">Who compromised ORION-9?</h2>
      <p className="mt-2 text-sm text-slate-300">Choose carefully. A wrong answer consumes an attempt and seals the chamber further.</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {ASTRA_REVEAL_OPTIONS.map((opt) => {
          const active = picked === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => setPicked(opt.id)}
                className={[
                  'w-full rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-rose-300/60 bg-rose-400/10 text-rose-100 shadow-[0_0_18px_rgba(251,113,133,0.25)]'
                    : 'border-white/10 text-slate-200 hover:border-rose-300/40 hover:text-rose-100'
                ].join(' ')}
              >
                <span className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-rose-200/80">Suspect</span>
                <p className="mt-1 text-base text-white">{opt.label}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-end">
        <Button variant="danger" disabled={!picked || busy} onClick={() => picked && onAnswer(isAstraReveal(picked))}>
          {busy ? 'Submitting…' : 'Submit verdict'}
        </Button>
      </div>
    </HudFrame>
  );
}
