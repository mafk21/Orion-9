import type { Phase, SignalRow, SystemLogRow } from '@/types/database';

/**
 * ASTRA is not a database entity. It is a deterministic logic layer that
 * shapes the narrative based on team state. It speaks through system_logs and
 * signals. Its tone shifts with phase progression.
 */

export interface AstraVoiceLine {
  id: string;
  phase: Phase | null;
  intent: 'greeting' | 'warning' | 'mislead' | 'reveal';
  body: string;
}

/** DEPRECATED: ASTRA voice lines must be defined by admin, not hardcoded. */
export const ASTRA_VOICE: AstraVoiceLine[] = [];

/** DEPRECATED: Reveal options must be defined by admin in endgame_config, not hardcoded. */
export const ASTRA_REVEAL_OPTIONS: Array<{ id: string; label: string; correct: boolean }> = [];

export function isAstraReveal(optionId: string): boolean {
  // DEPRECATED: Reveal logic must be defined in endgame_config by admin
  return false;
}

export function astraInfluenceForPhase(phase: Phase): 'subtle' | 'misleading' | 'aggressive' | 'exposed' {
  switch (phase) {
    case 1: return 'subtle';
    case 2: return 'misleading';
    case 3: return 'aggressive';
    case 4: return 'exposed';
  }
}

export function isLikelyFabricated(signal: SignalRow): boolean {
  if (signal.data?.authenticity === 'fabricated') return true;
  if (signal.data?.authenticity === 'suspect') return true;
  return false;
}

export function logSeverity(log: SystemLogRow): 'info' | 'warn' | 'critical' {
  const c = log.content.toLowerCase();
  if (c.includes('failed') || c.includes('breach') || c.includes('compromis')) return 'critical';
  if (c.includes('warn') || c.includes('drift') || c.includes('anomal')) return 'warn';
  return 'info';
}
