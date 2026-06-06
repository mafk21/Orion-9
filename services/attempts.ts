import { supabase } from '@/lib/supabase/client';
import type { AttemptRow, Phase } from '@/types/database';

export async function recordAttempt(input: { team_id: string; phase: Phase; success: boolean }) {
  const { data, error } = await supabase
    .from('attempts')
    .insert({ team_id: input.team_id, phase: input.phase, success: input.success })
    .select('*')
    .single();
  if (error) throw error;
  return data as AttemptRow;
}

export async function fetchAttemptsForTeam(teamId: string) {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AttemptRow[];
}
