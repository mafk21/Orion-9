import type { TeamRole } from './database';

export type { TeamRole } from './database';

export const TEAM_ROLES: TeamRole[] = ['captain', 'engineer', 'analyst', 'medic', 'hacker'];

export const ROLE_LABELS: Record<TeamRole, string> = {
  captain: 'Captain',
  engineer: 'Engineer',
  analyst: 'Analyst',
  medic: 'Medic',
  hacker: 'Hacker'
};

export const ROLE_TITLES: Record<TeamRole, string> = {
  captain: 'Command authority',
  engineer: 'Reactor and systems',
  analyst: 'Signal pattern analysis',
  medic: 'Crew vitals and triage',
  hacker: 'Intrusion and decryption'
};

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  captain: 'Owns the final access ordering. Receives the master sequence at endgame.',
  engineer: 'Provides the reactor fragment of the access code.',
  analyst: 'Provides the analytical fragment of the access code.',
  medic: 'Tracks crew vitals across the timeline of failures.',
  hacker: 'Provides the override fragment of the access code.'
};

export const ROLE_PERMISSIONS: Record<TeamRole, string[]> = {
  captain: ['team.manage', 'mission.attempt', 'endgame.submit', 'team.view'],
  engineer: ['mission.contribute', 'fragment.engineer', 'team.view'],
  analyst: ['mission.contribute', 'fragment.analyst', 'team.view'],
  medic: ['mission.contribute', 'team.view'],
  hacker: ['mission.contribute', 'fragment.hacker', 'team.view']
};
