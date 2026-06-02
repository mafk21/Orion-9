'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTeamWithMembers } from '@/services/teams';
import TeamCreator from '@/components/team/TeamCreator';
import TeamRoster from '@/components/team/TeamRoster';
import TeamLockedBanner from '@/components/team/TeamLockedBanner';
import AttemptIndicator from '@/components/team/AttemptIndicator';
import AuthGuard from '@/components/auth/AuthGuard';
import HudFrame from '@/components/ui/HudFrame';
import Card from '@/components/ui/Card';
import type { TeamWithMembers } from '@/types/team';

export default function CrewTeamPage() {
  const { team, membership } = useAuth();
  const [detail, setDetail] = useState<TeamWithMembers | null>(null);

  useEffect(() => {
    if (!team) return;
    let active = true;
    fetchTeamWithMembers(team.id).then((d) => active && setDetail(d));
    return () => { active = false; };
  }, [team?.id]);

  return (
    <AuthGuard>
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 space-y-6">
        {team && membership ? (
          <>
            <TeamLockedBanner team={team} />
            <HudFrame tone="cyan">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Membership confirmed</p>
                  <h1 className="mt-2 text-3xl font-semibold text-white">Team {team.name}</h1>
                  <p className="mt-2 text-sm text-slate-300">You are committed to this team. Membership is permanent and cannot be reassigned.</p>
                </div>
                <AttemptIndicator team={team} />
              </div>
              <div className="mt-6 rounded-2xl border border-white/8 bg-space-950/60 p-4 code-text text-xs text-cyan-100">
                Team ID · {team.id}
              </div>
            </HudFrame>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              {detail ? <TeamRoster team={detail} /> : <Card className="p-6"><p className="text-sm text-slate-400">Loading roster…</p></Card>}
              <div className="space-y-6">
                <Card className="p-6">
                  <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Join code</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Invite operatives</h3>
                  <p className="mt-2 text-sm text-slate-300">Share this 6-character code with other operatives to join your team.</p>
                  <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/6 p-4 text-center">
                    <span className="code-text text-3xl tracking-[0.25em] text-cyan-100 font-bold">{team.join_code}</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(team.join_code)}
                    className="mt-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-100 hover:bg-cyan-400/15"
                  >
                    Copy code
                  </button>
                </Card>
                <Card className="p-6">
                  <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Next steps</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Continue the investigation</h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li><Link href="/missions" className="block rounded-2xl border border-white/8 bg-space-950/70 p-4 text-slate-100 hover:border-cyan-400/30">Open the mission board</Link></li>
                    <li><Link href="/signals" className="block rounded-2xl border border-white/8 bg-space-950/70 p-4 text-slate-100 hover:border-cyan-400/30">Review signal feed</Link></li>
                    <li><Link href="/dashboard" className="block rounded-2xl border border-white/8 bg-space-950/70 p-4 text-slate-100 hover:border-cyan-400/30">Return to dashboard</Link></li>
                  </ul>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <TeamCreator />
        )}
      </main>
    </AuthGuard>
  );
}
