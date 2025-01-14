// app/api/utils/fetchTeamMembers.ts

import axios from 'axios';
import https from 'https';

export type TeamMember = {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
  isTeamAdmin?: boolean;
};

export const fetchTeamMembers = async (
  projectId: string,
  teamId: string
): Promise<TeamMember[]> => {
  const instance = 'tfs.pacific.costcotravel.com';
  const collection = 'TestAutomation';
  const pat = 'aHVudGVyLnJvY2hhQGNvc3Rjb3RyYXZlbC5jb206bnhmenF5Z2R1em5sdHl1c3h1NjdrbGNsZW4zb3c1emVpbGhpeHZra3BqNGc3bmtpY3p0cQ==';

  if (!instance || !collection || !pat) {
    throw new Error('Missing TFS_INSTANCE, TFS_COLLECTION, or TFS_PAT in environment variables.');
  }

  const encodedPAT = Buffer.from(`:${pat}`).toString('base64');

  const url = `https://${instance}/tfs/${collection}/_apis/projects/${projectId}/teams/${teamId}/members?api-version=4.1`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${encodedPAT}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production', // true in production
      }),
    });

    return response.data.value.map((member: any) => ({
      id: member.identity.id,
      displayName: member.identity.displayName,
      uniqueName: member.identity.uniqueName,
      imageUrl: member.identity.imageUrl,
      descriptor: member.identity.descriptor,
      isTeamAdmin: member.isTeamAdmin,
    })) as TeamMember[];
  } catch (error: any) {
    console.error(`Error fetching members for team ${teamId}:`, error.message);
    throw error;
  }
};
