'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSoloChallengesWithProgress } from '@/services/solo';
import Card from '@/components/ui/Card';
import HudFrame from '@/components/ui/HudFrame';
import SectionHeader from '@/components/ui/SectionHeader';
import SoloChallengeCard from '@/components/solo/SoloChallengeCard';
import SoloStatCard from '@/components/solo/SoloStatCard';
import type { SoloChallengeWithProgress } from '@/types/solo';

export default function SoloPage() {
  const router = useRouter();
  const { user, profile, isOmega } = useAuth();
  const [items, setItems] = useState<SoloChallengeWithProgress[]>([]);

  // OMEGA/admin account — must not enter gameplay flows
  useEffect(() => {
    if (!isOmega) return;
    router.replace('/admin');
  }, [isOmega, router]);

  if (isOmega) return null;

  async function load() {
    if (!user) return;
    const data = await fetchSoloChallengesWithProgress(user.id);
    setItems(data);
  }

  useEffect(() => { load(); }, [user?.id]);

  const completed = items.filter((c) => c.progress?.completed).length;
  const fragments = items.filter((c) => c.progress?.unlocked_hint && c.code_fragment).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-6">
      <HudFrame tone="violet">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-violet-200/80">Solo investigation</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Lore archive · {profile?.callsign ?? 'operative'}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Solo challenges expose indirect clues that misdirect or reinforce the main investigation. Code fragments unlocked here feed into the endgame.
        </p>
      </HudFrame>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SoloStatCard eyebrow="XP" value={(profile?.xp ?? 0).toLocaleString()} caption="Solo rank points across discoveries." accent="cyan" />
        <SoloStatCard eyebrow="Resolved" value={`${completed}/${items.length}`} caption="Solo challenges with confirmed resolution." accent="emerald" />
        <SoloStatCard eyebrow="Fragments" value={`${fragments}`} caption="Code pieces unlocked from solo investigation." accent="violet" />
        <SoloStatCard eyebrow="Clearance" value={profile?.clearance_level ?? 'OPERATIVE'} caption="Your access level for the ORION-9 archive." accent="cyan" />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader title="Solo challenges" subtitle="Indirect lore investigation" />
          <div className="flex flex-wrap gap-3">
            <Link href="/solo/missions" className="text-xs uppercase tracking-[0.25em] text-cyan-200/80 hover:text-cyan-100">Missions</Link>
            <Link href="/solo/signals" className="text-xs uppercase tracking-[0.25em] text-violet-200/80 hover:text-violet-100">Signals</Link>
            <Link href="/archive" className="text-xs uppercase tracking-[0.25em] text-cyan-200/80 hover:text-cyan-100">Archive</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 col-span-full">No solo challenges available yet.</p>
          ) : items.map((c) => <SoloChallengeCard key={c.id} challenge={c} onChange={load} />)}
        </div>
      </Card>
    </div>
  );
}
