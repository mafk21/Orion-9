import type { ReactNode } from 'react';
import OmegaGuard from '@/components/auth/OmegaGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <OmegaGuard>{children}</OmegaGuard>;
}
