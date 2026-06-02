'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInUp, glowButtonVariants } from '@/lib/animations';
import GlowingButton from '@/components/ui/GlowingButton';
import HudFrame from '@/components/ui/HudFrame';
import SignalWave from '@/components/ui/SignalWave';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, isOmega } = useAuth();
  const continueHref = user ? (isOmega ? '/admin' : '/dashboard') : '/auth';

  return (
    <main className="relative isolate overflow-hidden px-6 py-10 lg:px-12">
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%)]" />

      <section className="mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl flex-col justify-center gap-10 pb-16 pt-6 lg:pb-24">
        <div className="space-y-5 text-center">
          <motion.p {...fadeInUp} className="code-text text-sm uppercase tracking-[0.45em] text-cyan-300/80">
            Mission briefing // ORION-9
          </motion.p>
          <motion.h1 {...fadeInUp} className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Initiate rescue. Decode the silence.
          </motion.h1>
          <motion.p {...fadeInUp} className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Enter the ORION-9 command deck, survey the wreckage, and uncover the truth behind the mission failure.
          </motion.p>
        </div>

        <motion.div {...glowButtonVariants} className="mx-auto grid gap-4 sm:grid-cols-3 md:max-w-xl">
          <Link href={continueHref} className="inline-flex">
            <GlowingButton label={user ? 'Resume mission' : 'Engage mission'} />
          </Link>
          <Link href="/scan" className="inline-flex">
            <GlowingButton label="Scan signal" variant="secondary" />
          </Link>
          <Link href="/leaderboard" className="inline-flex">
            <GlowingButton label="Crew standings" variant="ghost" />
          </Link>
        </motion.div>

        <motion.div {...fadeInUp} className="grid gap-4 sm:grid-cols-3">
          <HudFrame tone="cyan">
            <p className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-cyan-200/80">Mission core</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Phase-driven objectives</h2>
            <p className="mt-2 text-sm text-slate-300">Four phases. Three attempts. The team that survives reaches the sealed chamber.</p>
          </HudFrame>
          <HudFrame tone="violet">
            <p className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-violet-200/80">Signal core</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Transmissions & signals</h2>
            <p className="mt-2 text-sm text-slate-300">Some signals are authentic. Some are deceptions. Decoding them reveals the truth.</p>
            <div className="mt-3"><SignalWave /></div>
          </HudFrame>
          <HudFrame tone="amber">
            <p className="code-text text-[0.66rem] uppercase tracking-[0.32em] text-amber-200/80">Endgame</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Identify the compromiser</h2>
            <p className="mt-2 text-sm text-slate-300">Reconstruct the master access vector. Choose carefully — only one suspect is correct.</p>
          </HudFrame>
        </motion.div>
      </section>
    </main>
  );
}
