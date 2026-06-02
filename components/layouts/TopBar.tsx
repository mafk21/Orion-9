'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

const MOBILE_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Missions', href: '/missions' },
  { label: 'Signals', href: '/signals' },
  { label: 'Crew', href: '/crew' },
  { label: 'Solo', href: '/solo' },
  { label: 'Scan', href: '/scan' },
  { label: 'Archive', href: '/archive' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Endgame', href: '/endgame' }
];

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const { user, profile, isOmega, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-space-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="hud-pulse inline-block h-2 w-2 rounded-full bg-cyan-300" />
          <div className="leading-tight">
            <p className="text-[0.62rem] uppercase tracking-[0.45em] text-cyan-300/80">ORION-9</p>
            <p className="code-text text-sm text-white">ORION-9 Operations</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="code-text text-[0.7rem] uppercase tracking-[0.25em] text-cyan-100/80">
                {profile?.callsign ?? user.email}
              </span>
              {isOmega ? (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.3em] text-amber-100">OMEGA</span>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Logout</Button>
            </div>
          ) : (
            <Link href="/auth" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm">Sign in</Button>
            </Link>
          )}

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-cyan-100"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="lg:hidden border-t border-white/5 bg-space-950/95 px-5 py-3">
          <ul className="grid grid-cols-2 gap-2">
            {MOBILE_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/8 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100"
                >{l.label}</Link>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full rounded-xl border border-rose-400/25 bg-rose-400/8 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-rose-100"
                >Logout</button>
              </li>
            ) : (
              <li>
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100"
                >Sign in</Link>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
