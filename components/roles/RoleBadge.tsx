import { ROLE_LABELS, ROLE_TITLES } from '@/types/roles';
import type { TeamRole } from '@/types/database';

export default function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100">
      {ROLE_LABELS[role]} · {ROLE_TITLES[role]}
    </span>
  );
}
