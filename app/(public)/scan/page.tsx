import Link from 'next/link';
import HudFrame from '@/components/ui/HudFrame';
import RadarScan from '@/components/ui/RadarScan';
import SignalWave from '@/components/ui/SignalWave';
import GlowingButton from '@/components/ui/GlowingButton';

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="cyan">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Active scan</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">ORION-9 deep scan console</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          A live diagnostic matrix of ORION-9&apos;s final transmissions. The radar sweeps continuously while the system processes returns.
        </p>
      </HudFrame>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex items-center justify-center rounded-3xl border border-cyan-400/15 bg-space-950/70 p-8 backdrop-blur-xl">
          <RadarScan size={320} />
        </div>

        <HudFrame tone="violet">
          <p className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-violet-200/80">Carrier waveforms</p>
          <div className="mt-3 space-y-3">
            <SignalWave label="channel α · 412.31 hz" />
            <SignalWave label="channel β · 419.04 hz" />
            <SignalWave label="channel γ · 428.72 hz" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/signals"><GlowingButton label="Review signals" /></Link>
            <Link href="/dashboard"><GlowingButton label="Mission deck" variant="secondary" /></Link>
          </div>
        </HudFrame>
      </div>
    </div>
  );
}
