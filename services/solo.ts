import { supabase } from '@/lib/supabase/client';
import type { SoloChallengeRow, SoloProgressRow } from '@/types/database';
import type { SoloChallengeWithProgress } from '@/types/solo';

export async function fetchSoloChallenges() {
  const { data, error } = await supabase
    .from('solo_challenges')
    .select('*')
    .order('phase', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SoloChallengeRow[];
}

export async function fetchSoloProgress(userId: string) {
  const { data, error } = await supabase.from('solo_progress').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as SoloProgressRow[];
}

export async function fetchSoloChallengesWithProgress(userId: string): Promise<SoloChallengeWithProgress[]> {
  const [challenges, progress] = await Promise.all([fetchSoloChallenges(), fetchSoloProgress(userId)]);
  return challenges.map((c) => ({
    ...c,
    progress: progress.find((p) => p.challenge_id === c.id) ?? null
  }));
}

export async function recordSoloProgress(userId: string, challengeId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('solo_progress')
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        completed,
        unlocked_hint: true,
        completed_at: completed ? new Date().toISOString() : null
      },
      { onConflict: 'user_id,challenge_id' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as SoloProgressRow;
}

export async function unlockHintOnly(userId: string, challengeId: string) {
  // Read current row to preserve completion when only revealing a hint
  const { data: existing } = await supabase
    .from('solo_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle();
  const wasCompleted = (existing as SoloProgressRow | null)?.completed ?? false;
  return recordSoloProgress(userId, challengeId, wasCompleted);
}

export async function createSoloChallenge(input: {
  title: string;
  clue: string;
  code_fragment?: string;
  lore_hint?: string;
  phase?: number | null;
}) {
  const { data, error } = await supabase
    .from('solo_challenges')
    .insert({
      title: input.title,
      clue: input.clue,
      code_fragment: input.code_fragment ?? null,
      lore_hint: input.lore_hint ?? null,
      phase: input.phase ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SoloChallengeRow;
}

export async function updateSoloChallenge(id: string, patch: Partial<SoloChallengeRow>) {
  const { data, error } = await supabase
    .from('solo_challenges')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as SoloChallengeRow;
}

export async function deleteSoloChallenge(id: string) {
  const { error } = await supabase.from('solo_challenges').delete().eq('id', id);
  if (error) throw error;
  return true;
}
