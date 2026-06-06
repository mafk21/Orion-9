import { supabase } from '@/lib/supabase/client';
import type { TeamRow, TeamMemberRow, ProfileRow, TeamRole } from '@/types/database';
import type { TeamWithMembers } from '@/types/team';

export async function fetchTeam(teamId: string) {
  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).maybeSingle();
  if (error) throw error;
  return (data as TeamRow | null) ?? null;
}

export async function fetchTeamByJoinCode(joinCode: string) {
  const code = joinCode.trim().toUpperCase();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('join_code', code)
    .maybeSingle();
  if (error) throw error;
  return (data as TeamRow | null) ?? null;
}

export async function fetchAllTeams() {
  const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TeamRow[];
}

export async function fetchMembership(userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as TeamMemberRow | null) ?? null;
}

export async function fetchTeamWithMembers(teamId: string): Promise<TeamWithMembers | null> {
  const team = await fetchTeam(teamId);
  if (!team) return null;

  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId);
  if (memberError) throw memberError;

  const userIds = (members ?? []).map((m) => (m as TeamMemberRow).user_id);
  let profiles: Pick<ProfileRow, 'id' | 'callsign' | 'email'>[] = [];

  if (userIds.length > 0) {
    const { data: profileRows, error: pErr } = await supabase
      .from('profiles')
      .select('id, callsign, email')
      .in('id', userIds);
    if (pErr) throw pErr;
    profiles = (profileRows ?? []) as Pick<ProfileRow, 'id' | 'callsign' | 'email'>[];
  }

  return {
    ...team,
    members: (members as TeamMemberRow[]).map((m) => ({
      ...m,
      profile: profiles.find((p) => p.id === m.user_id) ?? null
    }))
  };
}

function validateTeamName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 5) return 'Team name must be at least 5 characters.';
  if (trimmed.length > 15) return 'Team name must be at most 15 characters.';
  if (/\s/.test(trimmed)) return 'Team name must not contain spaces.';
  if (!/[A-Za-z]/.test(trimmed)) return 'Team name must contain at least one letter.';
  return null;
}

export async function createTeam(name: string, userId: string, role: TeamRole) {
  const existing = await fetchMembership(userId);
  if (existing) throw new Error('You already belong to a team. Membership is permanent.');

  const validationError = validateTeamName(name);
  if (validationError) throw new Error(validationError);

  const { data: team, error } = await supabase
    .from('teams')
    .insert({ name: name.trim(), created_by: userId })
    .select('*')
    .single();
  if (error) {
    // PostgreSQL unique violation (code 23505)
    if (error.code === '23505') {
      // Determine if the conflict is on the name constraint
      const msg = (error.message ?? error.details ?? '').toLowerCase();
      if (msg.includes('name')) {
        throw new Error('Team name is already taken. Please choose another.');
      }
    }
    if (error.message && error.message.includes('Team name must')) {
      throw error; // Re-throw our own validation errors from the DB trigger
    }
    throw error;
  }

  const { error: memberErr } = await supabase
    .from('team_members')
    .insert({ team_id: (team as TeamRow).id, user_id: userId, role });
  if (memberErr) throw memberErr;

  return team as TeamRow;
}

export async function joinTeam(joinCode: string, userId: string, role: TeamRole) {
  const existing = await fetchMembership(userId);
  if (existing) throw new Error('You already belong to a team. Membership is permanent.');

  const team = await fetchTeamByJoinCode(joinCode);
  if (!team) throw new Error('Invalid join code. Team not found.');
  if (team.locked) throw new Error('This team is locked. Membership is closed.');

  const { data: roleClash } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', team.id)
    .eq('role', role)
    .maybeSingle();
  if (roleClash) throw new Error(`Role "${role}" is already assigned in this team.`);

  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role });
  if (error) throw error;

  return team;
}

export async function lockTeam(teamId: string, locked: boolean) {
  const { data, error } = await supabase
    .from('teams')
    .update({ locked })
    .eq('id', teamId)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamRow;
}

export async function setTeamStatus(teamId: string, status: TeamRow['status']) {
  const { data, error } = await supabase
    .from('teams')
    .update({ status })
    .eq('id', teamId)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamRow;
}

export async function resetAttemptCount(teamId: string) {
  const { data, error } = await supabase
    .from('teams')
    .update({ attempt_count: 0, status: 'active', locked: false })
    .eq('id', teamId)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamRow;
}

export async function advancePhase(teamId: string) {
  const team = await fetchTeam(teamId);
  if (!team) throw new Error('Team not found.');
  if (team.phase >= 4) {
    return setTeamStatus(teamId, 'completed');
  }
  const { data, error } = await supabase
    .from('teams')
    .update({ phase: (team.phase + 1) as 1 | 2 | 3 | 4 })
    .eq('id', teamId)
    .select('*')
    .single();
  if (error) throw error;
  return data as TeamRow;
}

export async function updateMemberRole(teamId: string, memberUserId: string, newRole: TeamRole, requestedBy: string) {
  // Call the DB function that enforces leader-only access
  const { error } = await supabase.rpc('update_member_role', {
    p_team_id: teamId,
    p_member_user_id: memberUserId,
    p_new_role: newRole,
    p_requested_by: requestedBy
  });
  if (error) throw error;
}

export async function fetchTeamMemberCount(teamId: string): Promise<number> {
  const { count, error } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);
  if (error) throw error;
  return count ?? 0;
}
// Aliases for profile page
export async function getTeamByUser(userId: string) {
  const membership = await fetchMembership(userId);
  if (!membership) return null;
  return fetchTeam(membership.team.id);
}

export async function getTeamMembers(teamId: string) {
  const result = await fetchTeamWithMembers(teamId);
  return result?.members ?? [];
}
