import Link from 'next/link';
import HudFrame from '@/components/ui/HudFrame';
import GlowingButton from '@/components/ui/GlowingButton';

export default function SoloMissionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Solo missions</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Solo mission board</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          The solo mission board feeds into the global solo archive. Use the lore challenges to recover code fragments needed at the endgame.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/solo"><GlowingButton label="Open solo deck" /></Link>
          <Link href="/archive"><GlowingButton label="Open archive" variant="secondary" /></Link>
        </div>
      </HudFrame>
    </div>
  );
}
