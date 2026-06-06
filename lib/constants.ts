export const ROUTES = {
  home: '/',
  auth: '/auth',
  dashboard: '/dashboard',
  missions: '/missions',
  mission: (id: string) => `/mission/${id}` as const,
  crew: '/crew',
  scan: '/scan',
  signals: '/signals',
  leaderboard: '/leaderboard',
  solo: '/solo',
  archive: '/archive',
  endgame: '/endgame',
  admin: '/admin'
} as const;

export const PROTECTED_PATHS = [
  '/dashboard',
  '/missions',
  '/mission',
  '/crew',
  '/signals',
  '/solo',
  '/archive',
  '/admin',
  '/endgame'
];

export const ORION_BRAND = {
  name: 'ORION-9',
  tagline: 'Deep Space Rescue Investigation System',
  callsign: 'Rescue Operations'
};
