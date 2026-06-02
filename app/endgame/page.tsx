'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import SealedRoom from '@/components/endgame/SealedRoom';
import HudFrame from '@/components/ui/HudFrame';
import TeamLockedBanner from '@/components/team/TeamLockedBanner';
import { isTeamPlayable } from '@/lib/game-logic';

export default function EndgamePage() {
  const { team, membership } = useAuth();

  if (!team || !membership) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <HudFrame tone="amber">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-amber-200/80">Team required</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">The sealed chamber requires a full crew.</h1>
          <p className="mt-3 text-sm text-slate-300">Form or join a team to attempt the final access vector.</p>
          <Link href="/crew/team" className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-amber-100">Form team</Link>
        </HudFrame>
      </div>
    );
  }

  if (team.phase < 4 && isTeamPlayable(team)) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <HudFrame tone="violet">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Chamber sealed</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Phase {team.phase} of 4 — endgame locked.</h1>
          <p className="mt-3 text-sm text-slate-300">Resolve the active phase missions to unlock the sealed chamber.</p>
          <Link href="/missions" className="mt-4 inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-violet-100">Open mission board</Link>
        </HudFrame>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 space-y-6">
      <TeamLockedBanner team={team} />
      <SealedRoom team={team} role={membership.role} />
    </div>
  );
}
