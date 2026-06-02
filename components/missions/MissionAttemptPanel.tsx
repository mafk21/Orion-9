'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { attemptMission } from '@/services/missions';
import Button from '@/components/ui/Button';
import HudFrame from '@/components/ui/HudFrame';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import { isTeamPlayable } from '@/lib/game-logic';
import type { MissionRow, TeamRow } from '@/types/database';

export default function MissionAttemptPanel({ mission, team, role }: { mission: MissionRow; team: TeamRow; role: string | null }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isCaptain = role === 'captain';
  const playable = isTeamPlayable(team) && mission.status === 'active';

  async function submit(success: boolean) {
    setBusy(true);
    setError('');
    try {
      await attemptMission(mission.id, success);
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attempt failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <HudFrame tone={playable ? 'cyan' : 'amber'}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="code-text text-[0.72rem] uppercase tracking-[0.32em] text-cyan-200/80">Attempt control</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Resolve mission</h3>
          <p className="mt-1 text-sm text-slate-300">{isCaptain ? 'Captain authority required.' : 'Only the captain can resolve this mission.'}</p>
        </div>
        <AttemptIndicator team={team} />
      </div>
      {error ? <p className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/8 px-4 py-2 text-sm text-rose-100">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="primary" disabled={!playable || !isCaptain || busy} onClick={() => submit(true)}>
          Mark mission resolved
        </Button>
        <Button variant="danger" disabled={!playable || !isCaptain || busy} onClick={() => submit(false)}>
          Declare mission failed
        </Button>
      </div>
      {!playable ? (
        <p className="mt-4 text-xs uppercase tracking-[0.28em] text-amber-200/80">
          Mission is locked. Status: {mission.status.toUpperCase()} · Team: {team.status.toUpperCase()}
        </p>
      ) : null}
    </HudFrame>
  );
}
