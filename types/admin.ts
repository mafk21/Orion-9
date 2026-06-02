export type { AdminActionRow } from './database';

export type AdminTargetType =
  | 'team'
  | 'mission'
  | 'signal'
  | 'solo_challenge'
  | 'system_log'
  | 'profile';

export type AdminActionKind =
  | 'team.lock'
  | 'team.unlock'
  | 'team.reset_attempts'
  | 'team.fail'
  | 'mission.create'
  | 'mission.update'
  | 'mission.delete'
  | 'mission.set_status'
  | 'signal.inject'
  | 'signal.update'
  | 'signal.delete'
  | 'solo.create'
  | 'solo.update'
  | 'solo.delete'
  | 'log.inject'
  | 'system.simulate_failure';
