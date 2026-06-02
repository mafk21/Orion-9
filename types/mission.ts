import type { MissionRow, Phase, MissionStatus, MissionPayload } from './database';

export type { MissionRow, Phase, MissionStatus, MissionPayload };

export interface MissionAttemptInput {
  missionId: string;
  teamId: string;
  phase: Phase;
  success: boolean;
}

export interface MissionAttemptResult {
  success: boolean;
  newAttemptCount: number;
  teamLocked: boolean;
  teamFailed: boolean;
}

export const PHASE_LABELS: Record<Phase, string> = {
  1: 'Phase I — First Contact',
  2: 'Phase II — Drift Vector',
  3: 'Phase III — Containment Breach',
  4: 'Phase IV — Sealed Chamber'
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  1: 'Phase I investigation begins. Establish communication and gather initial data.',
  2: 'Phase II deepens the mystery. Decode signals and track patterns.',
  3: 'Phase III escalates. Analyze contradictions and identify false leads.',
  4: 'Phase IV concludes the investigation. Synthesize evidence and reach final verdict.'
};
