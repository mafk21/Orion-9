export type { SignalRow, SignalStatus, SignalData } from './database';

import type { SignalStatus } from './database';

export const SIGNAL_STATUS_ORDER: SignalStatus[] = ['received', 'decoded', 'resolved'];

export const SIGNAL_STATUS_LABELS: Record<SignalStatus, string> = {
  received: 'RECEIVED',
  decoded: 'DECODED',
  resolved: 'RESOLVED'
};
