import type { ReactNode } from 'react';
import Card from './Card';

export default function Panel({
  title,
  eyebrow,
  children,
  actions,
  className = ''
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={['p-6 md:p-8', className].join(' ')}>
      {(eyebrow || title || actions) && (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/6 pb-5">
          <div>
            {eyebrow ? <p className="text-[0.72rem] uppercase tracking-[0.35em] text-cyan-300/70">{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h2> : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </Card>
  );
}
