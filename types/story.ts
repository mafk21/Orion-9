import type { MissionRow, SignalRow, SystemLogRow } from './database';

export interface MissionEntry {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  updatedAt: string;
}

export interface SignalFragment {
  id: string;
  title: string;
  transcript: string;
  severity: 'low' | 'medium' | 'critical';
}

export interface CrewLog {
  id: string;
  crewMember: string;
  timeStamp: string;
  content: string;
  audioSource?: string;
}

export function missionToEntry(row: MissionRow): MissionEntry {
  return {
    id: row.id,
    title: row.title,
    description: (row.payload?.briefing as string | undefined) ?? '',
    status: row.status === 'active' ? 'active' : row.status === 'completed' ? 'completed' : 'locked',
    updatedAt: row.updated_at
  };
}

export function signalToFragment(row: SignalRow): SignalFragment {
  return {
    id: row.id,
    title: row.title,
    transcript: (row.data?.transcript as string | undefined) ?? '',
    severity:
      row.data?.authenticity === 'fabricated'
        ? 'critical'
        : row.data?.authenticity === 'suspect'
          ? 'medium'
          : 'low'
  };
}

export function logToCrewLog(row: SystemLogRow): CrewLog {
  return {
    id: row.id,
    crewMember: 'ORION-9',
    timeStamp: row.created_at,
    content: row.content
  };
}
