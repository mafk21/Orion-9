// Legacy shim — prefer '@/services/teams'.
export {
  fetchTeam as fetchCrew,
  fetchAllTeams as fetchCrews,
  fetchMembership as fetchCrewMembership,
  fetchTeamWithMembers as fetchCrewWithMembers,
  createTeam as createCrew,
  joinTeam as joinCrew
} from './teams';
