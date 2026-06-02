import type { ReactNode } from 'react';

export default function Terminal({
  title = 'ORION-9 TERMINAL',
  lines = [],
  children,
  className = ''
}: {
  title?: string;
  lines?: string[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={['rounded-3xl border border-cyan-400/15 bg-space-950/95 p-4 shadow-[0_14px_34px_rgba(6,182,212,0.18)]', className].join(' ')}>
      <header className="mb-4 flex items-center gap-3 border-b border-cyan-400/10 pb-3 text-[0.68rem] uppercase tracking-[0.35em] text-cyan-100/80">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-cyan-200">{title}</span>
      </header>
      <div className="space-y-2 font-mono text-sm text-cyan-100/90">
        {lines.map((line) => (
          <p key={line} className="whitespace-pre-wrap">{line}</p>
        ))}
        {children}
      </div>
    </section>
  );
}
