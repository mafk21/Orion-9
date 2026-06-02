import { supabase } from '@/lib/supabase/client';
import type { TeamMemberRow, TeamRole } from '@/types/database';
import { ROLE_PERMISSIONS } from '@/types/roles';

export async function fetchRoleAssignments(teamId: string) {
  const { data, error } = await supabase.from('team_members').select('*').eq('team_id', teamId);
  if (error) throw error;
  return (data ?? []) as TeamMemberRow[];
}

export async function getUserRole(userId: string): Promise<TeamRole | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return (data?.role as TeamRole | undefined) ?? null;
}

export async function hasPermission(userId: string, permission: string) {
  const role = await getUserRole(userId);
  if (!role) return false;
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}
