'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="code-text text-xs uppercase tracking-[0.4em] text-cyan-300/80 hud-pulse">Establishing handshake…</p>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
