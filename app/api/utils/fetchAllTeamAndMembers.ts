// app/api/utils/fetchAllTeamsAndMembers.ts

import { fetchTeamMembers, TeamMember } from "./fetchTeamMembers";
import { fetchAllTeams, Team } from "./fetchTeams";



export type TeamWithMembers = {
  team: Team;
  members: TeamMember[];
};

export const fetchAllTeamsAndMembers = async (): Promise<TeamWithMembers[]> => {
  const teams = await fetchAllTeams();

  const teamsWithMembersPromises = teams.map(async (team) => {
    const members = await fetchTeamMembers(team.projectId, team.id);
    return {
      team,
      members,
    };
  });

  return Promise.all(teamsWithMembersPromises);
};
