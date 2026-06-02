import type { ReactNode } from 'react';

export default function SoloStatCard({
  eyebrow,
  value,
  caption,
  accent = 'cyan',
  children
}: {
  eyebrow: string;
  value: string;
  caption: string;
  accent?: 'cyan' | 'violet' | 'emerald';
  children?: ReactNode;
}) {
  const tone = {
    cyan: 'border-cyan-400/20 bg-cyan-400/8 text-cyan-100',
    violet: 'border-violet-400/20 bg-violet-400/8 text-violet-100',
    emerald: 'border-emerald-400/20 bg-emerald-400/8 text-emerald-100'
  }[accent];

  return (
    <article className={`rounded-3xl border p-5 shadow-[0_18px_45px_rgba(8,14,27,0.35)] backdrop-blur-xl ${tone}`}>
      <p className="text-[0.68rem] uppercase tracking-[0.35em] text-slate-200/80">{eyebrow}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <strong className="text-3xl font-semibold text-white">{value}</strong>
        {children}
      </div>
      <p className="mt-3 text-sm text-slate-200/85">{caption}</p>
    </article>
  );
}
