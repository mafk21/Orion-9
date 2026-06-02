import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MissionDetailLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
