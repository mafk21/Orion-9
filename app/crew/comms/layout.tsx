import Link from 'next/link';
import HudFrame from '@/components/ui/HudFrame';
import GlowingButton from '@/components/ui/GlowingButton';

export default function CrewCommsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <HudFrame tone="violet">
          <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Team communications</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">System log feed</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Real-time system transmissions and team event log. Monitor activity, discoveries, and anomalies.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/crew"><GlowingButton label="Back to crew" /></Link>
          </div>
        </HudFrame>
      </div>
      {children}
    </div>
  );
}
