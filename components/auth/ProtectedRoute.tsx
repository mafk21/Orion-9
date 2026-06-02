'use client';

import AuthGuard from './AuthGuard';
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
