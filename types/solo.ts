export type { SoloChallengeRow, SoloProgressRow } from './database';

import type { SoloChallengeRow, SoloProgressRow } from './database';

export interface SoloChallengeWithProgress extends SoloChallengeRow {
  progress?: SoloProgressRow | null;
}
