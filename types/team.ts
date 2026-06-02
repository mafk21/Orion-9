export type { TeamRow, TeamStatus, TeamMemberRow, AttemptRow } from './database';

import type { TeamRow, TeamMemberRow } from './database';
import type { ProfileRow } from './database';

export interface TeamWithMembers extends TeamRow {
  members: Array<TeamMemberRow & { profile?: Pick<ProfileRow, 'id' | 'callsign' | 'email'> | null }>;
}

export const MAX_ATTEMPTS = 3;
