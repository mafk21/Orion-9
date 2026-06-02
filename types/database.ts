// Auto-mapped from sql/schema.sql. Hand-curated mirror of Supabase types.

export type ClearanceLevel = 'OPERATIVE' | 'COMMAND' | 'OMEGA';
export type TeamRole = 'captain' | 'engineer' | 'analyst' | 'medic' | 'hacker';
export type TeamStatus = 'active' | 'failed' | 'completed';
export type MissionStatus = 'active' | 'completed' | 'failed';
export type SignalStatus = 'received' | 'decoded' | 'resolved';
export type Phase = 1 | 2 | 3 | 4;

export interface ProfileRow {
  id: string;
  email: string;
  callsign: string | null;
  xp: number;
  clearance_level: ClearanceLevel;
  created_at: string;
}

export interface TeamRow {
  id: string;
  name: string;
  join_code: string;
  phase: Phase;
  attempt_count: number;
  status: TeamStatus;
  locked: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

export interface MissionPayload {
  briefing?: string;
  objectives?: Array<{ id: string; label: string; complete?: boolean }>;
  clues?: string[];
  timeline?: Array<{ at: string; entry: string }>;
  fragment?: { role: TeamRole; value: string };
  [key: string]: unknown;
}

export interface MissionRow {
  id: string;
  team_id: string | null;
  title: string;
  phase: Phase;
  status: MissionStatus;
  difficulty: number;
  payload: MissionPayload;
  created_at: string;
  updated_at: string;
}

export interface SignalData {
  transcript?: string;
  authenticity?: 'verified' | 'suspect' | 'fabricated';
  origin?: string;
  resolution?: string;
  [key: string]: unknown;
}

export interface SignalRow {
  id: string;
  team_id: string | null;
  title: string;
  status: SignalStatus;
  linked_mission_id: string | null;
  data: SignalData;
  created_at: string;
}

export interface SoloChallengeRow {
  id: string;
  title: string;
  clue: string;
  code_fragment: string | null;
  lore_hint: string | null;
  phase: Phase | null;
  created_at: string;
}

export interface SoloProgressRow {
  id: string;
  user_id: string;
  challenge_id: string;
  completed: boolean;
  unlocked_hint: boolean;
  completed_at: string | null;
}

export interface SystemLogRow {
  id: string;
  team_id: string | null;
  content: string;
  phase: Phase | null;
  hidden: boolean;
  created_at: string;
}

export interface AttemptRow {
  id: string;
  team_id: string;
  phase: Phase;
  success: boolean;
  created_at: string;
}

export interface AdminActionRow {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
