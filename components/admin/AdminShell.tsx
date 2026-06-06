'use client';

import { useState } from 'react';
import AdminUsersTab from './AdminUsersTab';
import AdminMissionsTab from './AdminMissionsTab';
import AdminTeamsTab from './AdminTeamsTab';
import AdminSoloTab from './AdminSoloTab';
import AdminSignalsTab from './AdminSignalsTab';
import AdminSystemTab from './AdminSystemTab';
import AdminGameConfigTab from './AdminGameConfigTab';
import HudFrame from '@/components/ui/HudFrame';

const TABS = ['users', 'missions', 'teams', 'solo', 'signals', 'system', 'config'] as const;
type Tab = typeof TABS[number];

export default function AdminShell() {
  const [tab, setTab] = useState<Tab>('users');
  return (
    <div className="space-y-6">
      <HudFrame tone="amber">
        <p className="code-text text-[0.72rem] uppercase tracking-[0.35em] text-amber-200/80">OMEGA clearance</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Admin operations console</h1>
        <p className="mt-2 text-sm text-slate-300">All actions on this console are written to <code className="code-text">admin_actions</code> and are auditable.</p>
      </HudFrame>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] transition border',
              tab === t
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                : 'border-white/10 text-slate-300 hover:border-amber-400/30'
            ].join(' ')}
          >{t}</button>
        ))}
      </div>
      <div>
        {tab === 'users' ? <AdminUsersTab /> : null}
        {tab === 'missions' ? <AdminMissionsTab /> : null}
        {tab === 'teams' ? <AdminTeamsTab /> : null}
        {tab === 'solo' ? <AdminSoloTab /> : null}
        {tab === 'signals' ? <AdminSignalsTab /> : null}
        {tab === 'system' ? <AdminSystemTab /> : null}
        {tab === 'config' ? <AdminGameConfigTab /> : null}
      </div>
    </div>
  );
}
