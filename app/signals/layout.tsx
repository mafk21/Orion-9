import type { ReactNode } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function SignalsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
