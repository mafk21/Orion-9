'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setTeamStatus } from '@/services/teams';
import { writeSystemLog } from '@/services/logs';
import { recordAttempt } from '@/services/attempts';
import { fetchGameConfig, fetchEndgameOptions, verifyEndgameOption } from '@/services/gameConfig';
import { verifyMasterCodeAgainst } from '@/lib/game-logic';
import AccessDenied from './AccessDenied';
import EndgameRevealQuiz from './EndgameRevealQuiz';
import HudFrame from '@/components/ui/HudFrame';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import { TEAM_ROLES, ROLE_LABELS } from '@/types/roles';
import type { TeamRow, TeamRole } from '@/types/database';
import type { GameConfig, EndgameOption } from '@/services/gameConfig';

type Stage = 'fragments' | 'order' | 'reveal' | 'complete' | 'failed';

interface Props {
  team: TeamRow;
  role: TeamRole | null;
}

const REQUIRED: TeamRole[] = ['engineer', 'analyst', 'hacker'];

export default function SealedRoom({ team, role }: Props) {
  const { refresh } = useAuth();
  
  // Config state
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [endgameOptions, setEndgameOptions] = useState<EndgameOption[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  
  // Fragment entry state
  const [stage, setStage] = useState<Stage>('fragments');
  const [fragments, setFragments] = useState<Record<string, string>>({});
  const [tail, setTail] = useState('');
  const [order, setOrder] = useState<TeamRole[]>(REQUIRED);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Load configuration
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [config, options] = await Promise.all([
          fetchGameConfig(),
          fetchEndgameOptions()
        ]);
        if (active) {
          setGameConfig(config);
          setEndgameOptions(options);
          setConfigLoading(false);
        }
      } catch (err) {
        console.error('Failed to load endgame config:', err);
        setConfigLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const allFragmentsIn = REQUIRED.every((r) => fragments[r]?.trim()) && tail.trim();
  const isCaptain = role === 'captain';

  const composedCode = useMemo(() => {
    if (!allFragmentsIn) return '';
    return [...order.map((r) => fragments[r]?.trim().toUpperCase() ?? ''), tail.trim()].join('-');
  }, [allFragmentsIn, fragments, tail, order]);

  function reorder(role: TeamRole, dir: -1 | 1) {
    const idx = order.indexOf(role);
    if (idx < 0) return;
    const next = [...order];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setOrder(next);
  }

  async function submitCode() {
    setError('');
    if (!gameConfig) {
      setError('Configuration not loaded.');
      return;
    }
    if (!verifyMasterCodeAgainst(composedCode, gameConfig.endgame_master_code)) {
      setError('Code rejected. The chamber remains sealed.');
      return;
    }
    setStage('reveal');
  }

  async function onRevealAnswer(optionId: string) {
    setBusy(true);
    setError('');
    try {
      // Check team status before allowing attempt
      if (!gameConfig) throw new Error('Configuration not loaded.');
      if (team.locked) throw new Error('Team is locked. No more attempts allowed.');
      if (team.attempt_count >= gameConfig.max_team_attempts) throw new Error(`Team has exhausted all ${gameConfig.max_team_attempts} attempts.`);
      if (team.status !== 'active') throw new Error(`Team status is ${team.status}. Cannot attempt endgame.`);

      const correct = await verifyEndgameOption(optionId);
      await recordAttempt({ team_id: team.id, phase: 4, success: correct });
      if (correct) {
        await setTeamStatus(team.id, 'completed');
        await writeSystemLog({
          team_id: team.id,
          phase: 4,
          content: 'Investigation complete. Mystery resolved. ORION-9 secured.'
        });
        setStage('complete');
      } else {
        await writeSystemLog({
          team_id: team.id,
          phase: 4,
          content: 'Final verification failed. The truth remains hidden.'
        });
        setStage('failed');
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setBusy(false);
    }
  }

  if (configLoading) {
    return (
      <HudFrame tone="violet">
        <p className="code-text text-xs uppercase tracking-[0.35em] text-violet-200/80 hud-pulse">Loading endgame…</p>
      </HudFrame>
    );
  }

  if (!gameConfig || gameConfig.endgame_master_code === 'UNSET') {
    return (
      <HudFrame tone="amber">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-amber-200/80">Configuration error</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Endgame not configured.</h2>
        <p className="mt-2 text-sm text-slate-300">Admin must configure the endgame master code and reveal options.</p>
      </HudFrame>
    );
  }

  if (stage === 'complete') {
    return (
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Phase IV resolved</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Investigation complete.</h2>
        <p className="mt-3 text-sm text-slate-300">The mystery is solved. The investigation closes here. Status: COMPLETED.</p>
      </HudFrame>
    );
  }

  if (stage === 'failed') {
    return (
      <HudFrame tone="rose">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-rose-200/80">Verification failed</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">The truth remains hidden.</h2>
        <p className="mt-3 text-sm text-slate-300">An attempt was logged. Reconvene and try again — if attempts remain.</p>
        <div className="mt-4"><AttemptIndicator team={team} /></div>
      </HudFrame>
    );
  }

  if (stage === 'reveal') {
    return (
      <EndgameRevealQuiz
        question={gameConfig.endgame_question}
        options={endgameOptions}
        onAnswer={onRevealAnswer}
        busy={busy}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AccessDenied />

      <HudFrame tone="violet">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Stage 1 · fragments</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Submit role fragments</h3>
        <p className="mt-2 text-sm text-slate-300">Each role discovered a piece of the access code. Format example: <span className="code-text">XX##-YY##-##-##</span></p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {REQUIRED.map((r) => (
            <label key={r} className="space-y-2 text-sm text-slate-200">
              <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-cyan-200/80">{ROLE_LABELS[r]} fragment</span>
              <input
                value={fragments[r] ?? ''}
                onChange={(e) => setFragments((f) => ({ ...f, [r]: e.target.value }))}
                placeholder="e.g., E19"
                className="w-full rounded-2xl border border-white/8 bg-space-950/80 px-4 py-3 text-slate-100 outline-none code-text uppercase"
              />
            </label>
          ))}
          <label className="space-y-2 text-sm text-slate-200">
            <span className="code-text text-[0.7rem] uppercase tracking-[0.28em] text-violet-200/80">Final component</span>
            <input
              value={tail}
              onChange={(e) => setTail(e.target.value)}
              placeholder="e.g., 11"
              className="w-full rounded-2xl border border-violet-400/25 bg-space-950/80 px-4 py-3 text-slate-100 outline-none code-text"
            />
          </label>
        </div>
      </HudFrame>

      <HudFrame tone="cyan">
        <div className="flex items-center justify-between">
          <div>
            <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Stage 2 · captain ordering</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Sequence the fragments</h3>
          </div>
          {isCaptain ? <Badge tone="success">Captain authority</Badge> : <Badge tone="warning">Captain locked</Badge>}
        </div>
        <p className="mt-2 text-sm text-slate-300">Only the captain may commit the order. Final component is fixed at the end.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {order.map((r, i) => (
            <div key={r} className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/6 px-3 py-2 code-text">
              <span className="text-[0.62rem] uppercase tracking-[0.3em] text-cyan-200/80">slot {i + 1}</span>
              <span className="text-base text-white uppercase">{fragments[r]?.trim() || ROLE_LABELS[r]}</span>
              <button disabled={!isCaptain || i === 0} onClick={() => reorder(r, -1)} className="text-xs text-cyan-200 disabled:opacity-30">↑</button>
              <button disabled={!isCaptain || i === order.length - 1} onClick={() => reorder(r, 1)} className="text-xs text-cyan-200 disabled:opacity-30">↓</button>
            </div>
          ))}
          <span className="rounded-2xl border border-violet-400/25 bg-violet-400/6 px-3 py-2 code-text uppercase text-violet-100">{tail || '??'}</span>
        </div>
        <div className="mt-5 rounded-2xl border border-white/8 bg-space-950/70 px-4 py-3 code-text text-sm text-cyan-100">
          {composedCode || '—'}
        </div>
        {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
        <div className="mt-5">
          <Button onClick={submitCode} disabled={!isCaptain || !allFragmentsIn || busy}>
            Commit access vector
          </Button>
        </div>
      </HudFrame>
    </div>
  );
}
            <h3 className="mt-2 text-xl font-semibold text-white">Sequence the fragments</h3>
          </div>
          {isCaptain ? <Badge tone="success">Captain authority</Badge> : <Badge tone="warning">Captain locked</Badge>}
        </div>
        <p className="mt-2 text-sm text-slate-300">Only the captain may commit the order. Tail is fixed at the end.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {order.map((r, i) => (
            <div key={r} className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/6 px-3 py-2 code-text">
              <span className="text-[0.62rem] uppercase tracking-[0.3em] text-cyan-200/80">slot {i + 1}</span>
              <span className="text-base text-white uppercase">{fragments[r]?.trim() || ROLE_LABELS[r]}</span>
              <button disabled={!isCaptain || i === 0} onClick={() => reorder(r, -1)} className="text-xs text-cyan-200 disabled:opacity-30">↑</button>
              <button disabled={!isCaptain || i === order.length - 1} onClick={() => reorder(r, 1)} className="text-xs text-cyan-200 disabled:opacity-30">↓</button>
            </div>
          ))}
          <span className="rounded-2xl border border-violet-400/25 bg-violet-400/6 px-3 py-2 code-text uppercase text-violet-100">{tail || '??'}</span>
        </div>
        <div className="mt-5 rounded-2xl border border-white/8 bg-space-950/70 px-4 py-3 code-text text-sm text-cyan-100">
          {composedCode || '—'}
        </div>
        {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
        <div className="mt-5">
          <Button onClick={submitCode} disabled={!isCaptain || !allFragmentsIn || busy}>
            Commit access vector
          </Button>
        </div>
      </HudFrame>
    </div>
  );
}
