import type { ReactNode } from 'react';

export default function Alert({
  children,
  tone = 'info',
  title,
  className = ''
}: {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  className?: string;
}) {
  const toneStyles = {
    info: 'border-cyan-400/20 bg-cyan-400/6 text-cyan-100',
    warning: 'border-amber-400/25 bg-amber-400/8 text-amber-50',
    success: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-50',
    danger: 'border-rose-400/25 bg-rose-400/8 text-rose-50'
  };

  return (
    <aside className={['rounded-2xl border p-4 backdrop-blur-xl', toneStyles[tone], className].join(' ')}>
      {title ? <p className="text-sm font-semibold uppercase tracking-[0.24em]">{title}</p> : null}
      <div className="mt-2 text-sm text-slate-200">{children}</div>
    </aside>
  );
}
