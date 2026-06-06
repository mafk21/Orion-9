import { supabase } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function createOrUpdateProfile(userId: string, email: string, callsign?: string) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      callsign: callsign ?? email.split('@')[0]
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
  return fetchProfile(userId);
}

export async function updateXp(userId: string, delta: number) {
  const profile = await fetchProfile(userId);
  if (!profile) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({ xp: profile.xp + delta })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function fetchTopProfiles(limit = 25) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, callsign, email, xp, clearance_level, created_at')
    .order('xp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}
