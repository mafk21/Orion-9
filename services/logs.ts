import { supabase } from '@/lib/supabase/client';
import type { SystemLogRow, Phase } from '@/types/database';

export async function fetchLogsForTeam(teamId: string | null, options?: { includeHidden?: boolean; phase?: Phase }) {
  let query = supabase.from('system_logs').select('*').order('created_at', { ascending: false });
  if (teamId) query = query.or(`team_id.eq.${teamId},team_id.is.null`);
  else query = query.is('team_id', null);
  if (!options?.includeHidden) query = query.eq('hidden', false);
  if (options?.phase) query = query.or(`phase.eq.${options.phase},phase.is.null`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SystemLogRow[];
}

export async function fetchAllLogs() {
  const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SystemLogRow[];
}

export async function writeSystemLog(input: {
  team_id?: string | null;
  content: string;
  phase?: Phase | null;
  hidden?: boolean;
}) {
  const { data, error } = await supabase
    .from('system_logs')
    .insert({
      team_id: input.team_id ?? null,
      content: input.content,
      phase: input.phase ?? null,
      hidden: input.hidden ?? false
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SystemLogRow;
}
