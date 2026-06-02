import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MissionsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
