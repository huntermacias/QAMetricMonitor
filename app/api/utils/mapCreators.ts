// app/api/utils/mapCreators.ts

import { TeamWithMembers } from "./fetchAllTeamAndMembers";


export const mapCreators = (teamsWithMembers: TeamWithMembers[]): Record<string, string> => {
  const creatorIds: Record<string, string> = {};

  teamsWithMembers.forEach(({ team, members }) => {
    members.forEach(member => {
      // Map by uniqueName (e.g., "PACIFIC\\shilpa.thomas")
      creatorIds[member.uniqueName] = member.id;

      // If you prefer mapping by displayName, uncomment below:
      // const key = member.displayName.toLowerCase().replace(/\s+/g, '');
      // creatorIds[key] = member.id;
    });
  });

  return creatorIds;
};
