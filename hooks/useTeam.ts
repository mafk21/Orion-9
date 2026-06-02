'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useTeam() {
  const { team, membership, isLoading } = useAuth();
  return { team, membership, isLoading, hasTeam: Boolean(team && membership) };
}
