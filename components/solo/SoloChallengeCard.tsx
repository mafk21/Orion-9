'use client';

import { useState } from 'react';
import { recordSoloProgress, unlockHintOnly } from '@/services/solo';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { SoloChallengeWithProgress } from '@/types/solo';

export default function SoloChallengeCard({ challenge, onChange }: { challenge: SoloChallengeWithProgress; onChange?: () => void }) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(Boolean(challenge.progress?.unlocked_hint));
  const [completed, setCompleted] = useState(Boolean(challenge.progress?.completed));
  const [busy, setBusy] = useState(false);

  async function reveal() {
    if (!user) return;
    setBusy(true);
    try {
      await unlockHintOnly(user.id, challenge.id);
      setRevealed(true);
      onChange?.();
    } finally {
      setBusy(false);
    }
  }

  async function markComplete() {
    if (!user) return;
    setBusy(true);
    try {
      await recordSoloProgress(user.id, challenge.id, true);
      setCompleted(true);
      onChange?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="code-text text-[0.62rem] uppercase tracking-[0.32em] text-cyan-300/70">
            {challenge.phase ? `Phase ${challenge.phase}` : 'Loose fragment'}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{challenge.title}</h3>
        </div>
        {completed ? <Badge tone="success">Resolved</Badge> : <Badge tone="info">Open</Badge>}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-200">{challenge.clue}</p>

      <div className="mt-4 space-y-3">
        {revealed && challenge.lore_hint ? (
          <p className="rounded-xl border border-violet-400/25 bg-violet-400/6 p-3 text-sm text-violet-100">
            <span className="code-text mr-2 text-[0.62rem] uppercase tracking-[0.32em] text-violet-200/80">Lore</span>
            {challenge.lore_hint}
          </p>
        ) : null}

        {revealed && challenge.code_fragment ? (
          <p className="rounded-xl border border-cyan-400/25 bg-cyan-400/6 p-3 text-sm text-cyan-100 code-text">
            Fragment · <strong>{challenge.code_fragment}</strong>
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!revealed ? (
          <Button size="sm" variant="secondary" onClick={reveal} disabled={busy}>Reveal hint</Button>
        ) : null}
        {!completed ? (
          <Button size="sm" variant="primary" onClick={markComplete} disabled={busy}>Mark resolved</Button>
        ) : null}
      </div>
    </Card>
  );
}
