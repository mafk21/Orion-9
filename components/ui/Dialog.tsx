import type { ReactNode } from 'react';

export default function Dialog({
  title,
  description,
  children,
  actions,
  className = ''
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={['space-y-4', className].join(' ')}>
      {(title || description) && (
        <header className="space-y-1">
          {title ? <h3 className="text-xl font-semibold text-white">{title}</h3> : null}
          {description ? <p className="text-sm text-slate-300">{description}</p> : null}
        </header>
      )}
      {children ? <div className="space-y-3">{children}</div> : null}
      {actions ? <footer className="flex flex-wrap items-center justify-end gap-3 pt-2">{actions}</footer> : null}
    </section>
  );
}
