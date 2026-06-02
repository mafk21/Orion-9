import { supabase } from '@/lib/supabase/client';
import type { AdminActionRow } from '@/types/database';
import type { AdminActionKind, AdminTargetType } from '@/types/admin';

export async function logAdminAction(input: {
  admin_id: string;
  action: AdminActionKind;
  target_type: AdminTargetType;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('admin_actions')
    .insert({
      admin_id: input.admin_id,
      action: input.action,
      target_type: input.target_type,
      target_id: input.target_id ?? null,
      metadata: input.metadata ?? {}
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as AdminActionRow;
}

export async function fetchAdminActions(limit = 100) {
  const { data, error } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AdminActionRow[];
}
