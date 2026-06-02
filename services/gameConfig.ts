import { supabase } from '@/lib/supabase/client';
import type { Phase } from '@/types/database';

export interface GameConfig {
  id: string;
  max_team_attempts: number;
  endgame_master_code: string;
  endgame_question: string;
  created_at: string;
  updated_at: string;
}

export interface EndgameOption {
  id: string;
  label: string;
  is_correct: boolean;
  position: number;
  created_at: string;
}

/**
 * Fetch the singleton game configuration.
 * Falls back to defaults if not set.
 */
export async function fetchGameConfig(): Promise<GameConfig> {
  const { data, error } = await supabase
    .from('game_config')
    .select('*')
    .single();

  if (error) {
    console.warn('Failed to fetch game config, using defaults:', error.message);
    return {
      id: '00000000-0000-0000-0000-000000000001',
      max_team_attempts: 3,
      endgame_master_code: 'UNSET',
      endgame_question: 'Who is responsible?',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return (data as GameConfig) || {
    id: '00000000-0000-0000-0000-000000000001',
    max_team_attempts: 3,
    endgame_master_code: 'UNSET',
    endgame_question: 'Who is responsible?',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Update game configuration (OMEGA only).
 */
export async function updateGameConfig(patch: Partial<GameConfig>) {
  const { data, error } = await supabase
    .from('game_config')
    .update(patch as never)
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select('*')
    .single();

  if (error) throw error;
  return data as GameConfig;
}

/**
 * Fetch endgame reveal options (sorted by position).
 */
export async function fetchEndgameOptions(): Promise<EndgameOption[]> {
  const { data, error } = await supabase
    .from('endgame_options')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EndgameOption[];
}

/**
 * Create an endgame option (OMEGA only).
 */
export async function createEndgameOption(input: {
  label: string;
  is_correct: boolean;
  position?: number;
}) {
  const { data, error } = await supabase
    .from('endgame_options')
    .insert({
      label: input.label,
      is_correct: input.is_correct,
      position: input.position ?? 1
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as EndgameOption;
}

/**
 * Update an endgame option (OMEGA only).
 */
export async function updateEndgameOption(id: string, patch: Partial<EndgameOption>) {
  const { data, error } = await supabase
    .from('endgame_options')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as EndgameOption;
}

/**
 * Delete an endgame option (OMEGA only).
 */
export async function deleteEndgameOption(id: string) {
  const { error } = await supabase
    .from('endgame_options')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Verify if a selected endgame option is correct.
 */
export async function verifyEndgameOption(optionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('endgame_options')
    .select('is_correct')
    .eq('id', optionId)
    .maybeSingle();

  if (error || !data) return false;
  return (data as EndgameOption).is_correct;
}
