import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function SoloLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
