'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = { label: string; href: string; omega?: boolean; auth?: boolean };

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', auth: true },
  { label: 'Missions',  href: '/missions',  auth: true },
  { label: 'Signals',   href: '/signals',   auth: true },
  { label: 'Crew',      href: '/crew',      auth: true },
  { label: 'Solo',      href: '/solo',      auth: true },
  { label: 'Scan',      href: '/scan' },
  { label: 'Archive',   href: '/archive',   auth: true },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Endgame',   href: '/endgame',   auth: true },
  { label: 'Admin',     href: '/admin',     omega: true }
];

export default function SideNav() {
  const pathname = usePathname();
  const { user, isOmega } = useAuth();

  const items = NAV.filter((it) => (it.omega ? isOmega : true)).filter((it) => (it.auth ? Boolean(user) : true));

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-space-950/70 px-5 py-6 backdrop-blur-xl">
      <Link href="/" className="mb-8 block">
        <p className="text-[0.66rem] uppercase tracking-[0.45em] text-cyan-300/70">ORION-9</p>
        <p className="mt-1 text-base font-semibold text-white">Command Center</p>
      </Link>
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                'rounded-xl px-3 py-2 transition border',
                active
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.18)]'
                  : 'border-transparent text-slate-300 hover:border-white/8 hover:bg-white/5 hover:text-white'
              ].join(' ')}
            >
              <span className="code-text uppercase tracking-[0.18em] text-[0.72rem]">{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6">
        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-cyan-300/50">Build · 9.4.1</p>
      </div>
    </aside>
  );
}
