import AuthGuard from '@/components/auth/AuthGuard';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import Badge from '@/components/ui/Badge';
import { TEAM_ROLES, ROLE_LABELS, ROLE_TITLES, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '@/types/roles';

export default function CrewRolesPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
        <HudFrame tone="violet">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Role matrix</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Crew assignments</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Each role contributes uniquely to the rescue. Captain submits the final access vector. Engineer, Analyst and Hacker each provide a code fragment. The Medic monitors crew vitals and recovers timeline anomalies.
          </p>
        </HudFrame>

        <div className="grid gap-6 lg:grid-cols-2">
          {TEAM_ROLES.map((r) => (
            <Card key={r} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="code-text text-[0.62rem] uppercase tracking-[0.32em] text-cyan-200/80">{ROLE_TITLES[r]}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{ROLE_LABELS[r]}</h2>
                </div>
                <Badge tone={r === 'captain' ? 'warning' : 'info'}>{r.toUpperCase()}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-300">{ROLE_DESCRIPTIONS[r]}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {ROLE_PERMISSIONS[r].map((perm) => (
                  <li key={perm} className="rounded-full border border-white/10 bg-space-950/70 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-cyan-100">{perm}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
