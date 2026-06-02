import Card from '@/components/ui/Card';
import type { ReactNode } from 'react';

export default function RoleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6 md:p-8">
      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">Role-specific</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4 text-sm text-slate-300">{children}</div>
    </Card>
  );
}
