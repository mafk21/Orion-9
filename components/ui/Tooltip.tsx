import type { ReactNode } from 'react';

export default function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-cyan-400/20 bg-space-950/95 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-cyan-100 shadow-[0_10px_30px_rgba(6,182,212,0.18)] group-hover:block">{label}</span>
    </span>
  );
}
