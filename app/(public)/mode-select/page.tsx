'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HudFrame from '@/components/ui/HudFrame';
import GlowingButton from '@/components/ui/GlowingButton';

const modes = [
  {
    title: 'Solo protocol',
    href: '/solo',
    tone: 'violet' as const,
    description: 'Investigate alone. Decode lore fragments and accumulate code pieces while staying outside the team chain of command.'
  },
  {
    title: 'Crew protocol',
    href: '/crew/team',
    tone: 'cyan' as const,
    description: 'Assemble a five-role team — captain, engineer, analyst, medic, hacker. Membership is permanent.'
  }
];

export default function ModeSelectPage() {
  const router = useRouter();
  const { isLoading, user, isOmega } = useAuth();

  // Protect this page: unauthenticated users go to auth
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [isLoading, user, router]);

  // Admin/OMEGA users bypass onboarding and go directly to admin dashboard
  useEffect(() => {
    if (!isLoading && user && isOmega) {
      router.replace('/admin');
    }
  }, [isLoading, user, isOmega, router]);

  if (isLoading || !user || isOmega) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="mb-10 text-center">
        <p className="code-text text-sm uppercase tracking-[0.45em] text-cyan-300/80">
          ORION-9 // Operation mode
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Choose your operation mode
        </h1>
        <p className="mt-3 text-base text-slate-300">
          You cannot enter the application before selecting one.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {modes.map((mode) => (
          <HudFrame key={mode.href} tone={mode.tone}>
            <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-cyan-200/80">Operation mode</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{mode.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{mode.description}</p>
            <div className="mt-5">
              <Link href={mode.href}><GlowingButton label="Engage" variant={mode.tone === 'cyan' ? 'primary' : 'secondary'} /></Link>
            </div>
          </HudFrame>
        ))}
      </div>
    </div>
  );
}
