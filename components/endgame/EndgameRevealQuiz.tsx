'use client';

import HudFrame from '@/components/ui/HudFrame';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import type { EndgameOption } from '@/services/gameConfig';

export default function EndgameRevealQuiz({
  question,
  options,
  onAnswer,
  busy = false
}: {
  question: string;
  options: EndgameOption[];
  onAnswer: (optionId: string) => void | Promise<void>;
  busy?: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <HudFrame tone="rose">
      <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-rose-200/80">Final verification</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">{question}</h2>
      <p className="mt-2 text-sm text-slate-300">Choose carefully. A wrong answer consumes an attempt.</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
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
                <span className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-rose-200/80">Option</span>
                <p className="mt-1 text-base text-white">{opt.label}</p>
              </button>
            </li>
          );
        })}
      </ul>

      {options.length === 0 ? (
        <p className="mt-4 text-sm text-amber-200">No options configured yet.</p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button variant="danger" disabled={!picked || busy || options.length === 0} onClick={() => picked && onAnswer(picked)}>
          {busy ? 'Submitting…' : 'Submit answer'}
        </Button>
      </div>
    </HudFrame>
  );
}
