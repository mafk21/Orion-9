import { supabase } from '@/lib/supabase/client';
import type { MissionRow, MissionStatus, MissionPayload, Phase, TeamRow } from '@/types/database';
import { advancePhase, fetchTeam } from './teams';
import { recordAttempt } from './attempts';
import { writeSystemLog } from './logs';
import { fetchGameConfig } from './gameConfig';

export async function fetchMissionsForTeam(teamId: string) {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('team_id', teamId)
    .order('phase', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MissionRow[];
}

export async function fetchMission(id: string) {
  const { data, error } = await supabase.from('missions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as MissionRow | null) ?? null;
}

export async function fetchAllMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('phase', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MissionRow[];
}

export async function createMission(input: {
  team_id?: string | null;
  title: string;
  phase: Phase;
  difficulty?: number;
  payload?: MissionPayload;
  status?: MissionStatus;
}) {
  const { data, error } = await supabase
    .from('missions')
    .insert({
      team_id: input.team_id ?? null,
      title: input.title,
      phase: input.phase,
      difficulty: input.difficulty ?? 2,
      payload: input.payload ?? {},
      status: input.status ?? 'active'
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as MissionRow;
}

export async function updateMission(id: string, patch: Partial<MissionRow>) {
  const { data, error } = await supabase
    .from('missions')
    .update(patch as never)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as MissionRow;
}

export async function deleteMission(id: string) {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function attemptMission(missionId: string, success: boolean) {
  const mission = await fetchMission(missionId);
  if (!mission) throw new Error('Mission not found.');
  if (!mission.team_id) throw new Error('Mission has no team assigned.');

  const team = await fetchTeam(mission.team_id);
  if (!team) throw new Error('Team not found.');
  if (team.status !== 'active') throw new Error(`Team status is ${team.status}. Cannot attempt missions.`);
  if (team.locked) throw new Error('Team is locked. No more attempts allowed.');

  // Check if team is at max attempts
  const config = await fetchGameConfig();
  if (team.attempt_count >= config.max_team_attempts) {
    throw new Error(`Team has exhausted all ${config.max_team_attempts} attempts.`);
  }

  await recordAttempt({ team_id: mission.team_id, phase: mission.phase, success });

  if (success) {
    await updateMission(missionId, { status: 'completed' });
    await writeSystemLog({
      team_id: mission.team_id,
      phase: mission.phase,
      content: `Mission "${mission.title}" resolved. Phase ${mission.phase} integrity restored.`
    });
    if (team.phase === mission.phase) {
      await advancePhase(mission.team_id);
    }
  } else {
    await updateMission(missionId, { status: 'failed' });
    await writeSystemLog({
      team_id: mission.team_id,
      phase: mission.phase,
      content: `Mission "${mission.title}" failed. Attempt recorded.`
    });
  }

  const refreshed = await fetchTeam(mission.team_id);
  return {
    success,
    team: refreshed as TeamRow,
    mission: await fetchMission(missionId)
  };
}
