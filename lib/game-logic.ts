import type { TeamRow, AttemptRow, Phase } from '@/types/database';
import { MAX_ATTEMPTS as DEFAULT_MAX_ATTEMPTS } from '@/types/team';

/**
 * Attempt limit is now configurable in game_config.max_team_attempts.
 * These helpers accept the limit as a parameter.
 */
export function attemptsRemaining(team: TeamRow, maxAttempts: number = DEFAULT_MAX_ATTEMPTS): number {
  return Math.max(0, maxAttempts - team.attempt_count);
}

export function isTeamFailed(team: TeamRow, maxAttempts: number = DEFAULT_MAX_ATTEMPTS): boolean {
  return team.status === 'failed' || team.attempt_count >= maxAttempts;
}

export function isTeamCompleted(team: TeamRow): boolean {
  return team.status === 'completed';
}

export function isTeamPlayable(team: TeamRow, maxAttempts: number = DEFAULT_MAX_ATTEMPTS): boolean {
  return team.status === 'active' && team.attempt_count < maxAttempts;
}

export function lastAttempt(attempts: AttemptRow[]): AttemptRow | null {
  if (attempts.length === 0) return null;
  return attempts[0];
}

export function phaseOf(team: TeamRow): Phase {
  return team.phase;
}

export function phaseProgress(phase: Phase): number {
  return Math.round(((phase - 1) / 3) * 100);
}

export interface MasterCodeFragments {
  engineer?: string;
  analyst?: string;
  hacker?: string;
  captainOrder?: string[]; // captain orders the fragments
  /** numeric tail provided by the medic via solo lore */
  tail?: string;
}

/**
 * Master access code pattern validation.
 * Pattern must match: LETTER + 2DIGITS - LETTER + 2DIGITS - 2DIGITS - 2DIGITS
 * Example: E19-B04-72-11
 * 
 * DEPRECATED: Master code is now configurable in game_config table.
 * Use verifyMasterCodeAgainst() instead.
 */
export const MASTER_CODE_PATTERN = /^[A-Z]\d{2}-[A-Z]\d{2}-\d{2}-\d{2}$/;

export const MASTER_CODE_EXPECTED = 'UNSET';  // Deprecated; use game_config.endgame_master_code

export function buildMasterCode(fragments: MasterCodeFragments): string | null {
  const order = fragments.captainOrder ?? ['engineer', 'analyst', 'hacker'];
  const map: Record<string, string | undefined> = {
    engineer: fragments.engineer,
    analyst: fragments.analyst,
    hacker: fragments.hacker
  };
  const parts = order.map((slot) => map[slot]).filter(Boolean) as string[];
  if (parts.length !== 3) return null;
  if (!fragments.tail) return null;
  return [...parts, fragments.tail].join('-').toUpperCase();
}

/**
 * Verify that submitted code matches expected code.
 * This is the current production function.
 */
export function verifyMasterCodeAgainst(submittedCode: string, expectedCode: string): boolean {
  if (!expectedCode || expectedCode === 'UNSET') {
    // No endgame configured yet
    return false;
  }
  return submittedCode.trim().toUpperCase() === expectedCode.trim().toUpperCase();
}

/**
 * DEPRECATED: Use verifyMasterCodeAgainst() instead.
 */
export function verifyMasterCode(code: string): boolean {
  // Kept for backward compatibility, but always returns false since code is now configurable
  return false;
}
