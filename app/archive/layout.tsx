import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
