import type { ReactNode } from 'react';
import SideNav from './SideNav';
import TopBar from './TopBar';
import Starfield from '@/components/Starfield';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-space-950 text-slate-100">
      <Starfield />
      <div className="relative z-10 flex min-h-screen">
        <SideNav />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="relative flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
