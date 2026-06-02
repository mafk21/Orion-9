'use client';

import Card from '@/components/ui/Card';

export default function CrewInviteCard({ teamId }: { teamId: string }) {
  return (
    <Card className="p-6 md:p-8">
      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Invite reference</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Share this team ID</h3>
      <p className="mt-3 text-sm text-slate-300">Operatives use this ID on the Join screen. Membership remains permanent once committed.</p>
      <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/6 p-4 code-text text-sm tracking-[0.12em] text-cyan-100 break-all">{teamId}</div>
    </Card>
  );
}
