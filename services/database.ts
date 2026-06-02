import { supabase } from '@/lib/supabase/client';

export async function fetchTable<T>(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function fetchOne<T>(table: string, id: string) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as T | null;
}

export async function insertRow<T>(table: string, values: Record<string, unknown>) {
  const { data, error } = await supabase.from(table).insert(values as never).select('*').single();
  if (error) throw error;
  return data as T;
}

export async function updateRow<T>(table: string, id: string, values: Record<string, unknown>) {
  const { data, error } = await supabase.from(table).update(values as never).eq('id', id).select('*').single();
  if (error) throw error;
  return data as T;
}

export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}
