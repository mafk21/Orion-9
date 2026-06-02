'use client';

import { useEffect, useState } from 'react';
import { hasPermission } from '@/services/roles';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!user) { setAllowed(false); return; }
    let mounted = true;
    hasPermission(user.id, permission).then((ok) => mounted && setAllowed(ok));
    return () => { mounted = false; };
  }, [user?.id, permission]);

  if (!allowed) return null;
  return <>{children}</>;
}
