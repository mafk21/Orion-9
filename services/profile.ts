import { supabase } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database';

export interface Profile extends ProfileRow {}

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

export async function updateProfile(userId: string, patch: Partial<Pick<ProfileRow, 'callsign' | 'clearance_level'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch as never)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function deleteUser(userId: string) {
  // Note: This will cascade delete related records due to ON DELETE CASCADE
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
  return true;
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
