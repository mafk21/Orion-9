import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import AppShell from '@/components/layouts/AppShell';
import AppProviders from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'ORION-9 | Rescue Protocol',
  description: 'A cinematic sci-fi investigation experience for rescue crews.',
  metadataBase: new URL('http://localhost:3000')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen bg-space-950 text-slate-100 antialiased">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
