'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { fetchProfile } from '@/services/profile';
import { fetchMembership, fetchTeam } from '@/services/teams';
import type { ProfileRow, TeamMemberRow, TeamRow } from '@/types/database';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  membership: TeamMemberRow | null;
  team: TeamRow | null;
  isLoading: boolean;
  isOmega: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [membership, setMembership] = useState<TeamMemberRow | null>(null);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [isLoading, setLoading] = useState(true);

  const hydrate = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      setMembership(null);
      setTeam(null);
      return;
    }
    const p = await fetchProfile(nextUser.id).catch(() => null);
    setProfile(p);
    const m = await fetchMembership(nextUser.id).catch(() => null);
    setMembership(m);
    if (m) {
      const t = await fetchTeam(m.team_id).catch(() => null);
      setTeam(t);
    } else {
      setTeam(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    await hydrate(data.session?.user ?? null);
  }, [hydrate]);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await hydrate(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await hydrate(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setMembership(null);
    setTeam(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      membership,
      team,
      isLoading,
      isOmega: profile?.clearance_level === 'OMEGA',
      refresh,
      signOut
    }),
    [user, session, profile, membership, team, isLoading, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
