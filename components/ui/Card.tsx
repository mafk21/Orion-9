import type { ReactNode } from 'react';

export default function Card({
  children,
  className = '',
  elevated = true,
  tone = 'default'
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  tone?: 'default' | 'warning' | 'success' | 'danger';
}) {
  const toneStyles = {
    default: 'border border-white/8 bg-space-900/82 text-slate-100',
    warning: 'border border-amber-400/25 bg-amber-400/6 text-amber-50',
    success: 'border border-emerald-400/25 bg-emerald-400/6 text-emerald-50',
    danger: 'border border-rose-400/25 bg-rose-400/6 text-rose-50'
  };

  return (
    <article
      className={[
        'rounded-3xl backdrop-blur-xl',
        toneStyles[tone],
        elevated ? 'shadow-[0_18px_60px_rgba(8,14,27,0.45)]' : '',
        className
      ].join(' ')}
    >
      {children}
    </article>
  );
}
