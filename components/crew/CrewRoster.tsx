'use client';

import Card from '@/components/ui/Card';
import TeamRoster from '@/components/team/TeamRoster';
import type { TeamWithMembers } from '@/types/team';

export default function CrewRoster({ team }: { team?: TeamWithMembers | null }) {
  if (!team) {
    return (
      <Card className="p-6 md:p-8">
        <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Roster</p>
        <h3 className="mt-2 text-xl font-semibold text-white">No team detected</h3>
        <p className="mt-3 text-sm text-slate-300">Form a team to populate the roster.</p>
      </Card>
    );
  }
  return <TeamRoster team={team} />;
}
