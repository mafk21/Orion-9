import { supabase } from '@/lib/supabase/client';
import type { SignalRow, SignalStatus, SignalData } from '@/types/database';

export async function fetchSignalsForTeam(teamId: string) {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .or(`team_id.eq.${teamId},team_id.is.null`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SignalRow[];
}

export async function fetchPublicSignals() {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .is('team_id', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SignalRow[];
}

export async function fetchAllSignals() {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SignalRow[];
}

export async function injectSignal(input: {
  team_id?: string | null;
  title: string;
  status?: SignalStatus;
  linked_mission_id?: string | null;
  data?: SignalData;
}) {
  const { data, error } = await supabase
    .from('signals')
    .insert({
      team_id: input.team_id ?? null,
      title: input.title,
      status: input.status ?? 'received',
      linked_mission_id: input.linked_mission_id ?? null,
      data: input.data ?? {}
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SignalRow;
}

export async function advanceSignalStatus(id: string, status: SignalStatus) {
  const { data, error } = await supabase
    .from('signals')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as SignalRow;
}

export async function updateSignal(id: string, patch: Partial<SignalRow>) {
  const { data, error } = await supabase
    .from('signals')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as SignalRow;
}

export async function deleteSignal(id: string) {
  const { error } = await supabase.from('signals').delete().eq('id', id);
  if (error) throw error;
  return true;
}
