'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OmegaGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user, isOmega } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/auth');
    else if (!isOmega) router.replace('/dashboard');
  }, [isLoading, user, isOmega, router]);

  if (isLoading || !user || !isOmega) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="code-text text-xs uppercase tracking-[0.4em] text-amber-200/80 hud-pulse">Verifying OMEGA clearance…</p>
      </div>
    );
  }

  return <>{children}</>;
}
