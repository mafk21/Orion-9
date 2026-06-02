'use client';

import Card from '@/components/ui/Card';
import RoleBadge from './RoleBadge';
import { TEAM_ROLES, ROLE_DESCRIPTIONS } from '@/types/roles';

export default function RolePanel() {
  return (
    <Card className="p-6 md:p-8">
      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Role matrix</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Crew roles</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {TEAM_ROLES.map((role) => (
          <article key={role} className="rounded-2xl border border-white/8 bg-space-950/70 p-4">
            <RoleBadge role={role} />
            <p className="mt-3 text-sm text-slate-300">{ROLE_DESCRIPTIONS[role]}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
