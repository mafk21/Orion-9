'use client';

import { useAuth } from '@/contexts/AuthContext';
import Badge from '@/components/ui/Badge';

export default function AuthStatus() {
  const { user, isLoading, profile, isOmega } = useAuth();
  if (isLoading) return <Badge tone="info">Checking session…</Badge>;
  if (!user) return <Badge tone="warning">Guest mode</Badge>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="success">Authenticated</Badge>
      {profile?.callsign ? <Badge tone="info">{profile.callsign}</Badge> : null}
      {isOmega ? <Badge tone="warning">OMEGA clearance</Badge> : null}
    </div>
  );
}
