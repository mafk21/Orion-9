import type { ReactNode } from 'react';

export default function HudFrame({
  children,
  className = '',
  tone = 'cyan'
}: {
  children: ReactNode;
  className?: string;
  tone?: 'cyan' | 'violet' | 'amber' | 'rose';
}) {
  const tones = {
    cyan:   'border-cyan-400/30',
    violet: 'border-violet-400/30',
    amber:  'border-amber-400/30',
    rose:   'border-rose-400/30'
  } as const;

  return (
    <div className={`relative rounded-2xl border ${tones[tone]} bg-space-950/60 p-5 backdrop-blur-xl ${className}`}>
      <span className={`pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t ${tones[tone]}`} />
      <span className={`pointer-events-none absolute -right-px -top-px h-3 w-3 border-r border-t ${tones[tone]}`} />
      <span className={`pointer-events-none absolute -left-px -bottom-px h-3 w-3 border-l border-b ${tones[tone]}`} />
      <span className={`pointer-events-none absolute -right-px -bottom-px h-3 w-3 border-r border-b ${tones[tone]}`} />
      {children}
    </div>
  );
}
