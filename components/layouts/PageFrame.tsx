import type { ReactNode } from 'react';

export default function PageFrame({
  children,
  eyebrow,
  title,
  description
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
      <article className="rounded-3xl border border-white/8 bg-space-900/85 p-8 shadow-neon backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/70">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
        <div className="mt-8">{children}</div>
      </article>
    </section>
  );
}
