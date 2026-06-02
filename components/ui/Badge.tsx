export default function Badge({
  children,
  tone = 'info',
  className = ''
}: {
  children: React.ReactNode;
  tone?: 'info' | 'warning' | 'success' | 'danger';
  className?: string;
}) {
  const toneStyles = {
    info: 'border border-cyan-400/25 bg-cyan-400/8 text-cyan-100',
    warning: 'border border-amber-400/25 bg-amber-400/8 text-amber-50',
    success: 'border border-emerald-400/25 bg-emerald-400/8 text-emerald-50',
    danger: 'border border-rose-400/25 bg-rose-400/8 text-rose-50'
  };

  return <span className={['rounded-full px-3 py-1 text-[0.72rem] uppercase tracking-[0.28em]', toneStyles[tone], className].join(' ')}>{children}</span>;
}
