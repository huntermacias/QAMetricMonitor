// app/api/utils/fetchTeams.ts

import axios from 'axios';
import https from 'https';

export type Team = {
  id: string;
  name: string;
  url: string;
  description: string;
  identityUrl: string;
  projectName: string;
  projectId: string;
};

export const fetchAllTeams = async (): Promise<Team[]> => {
  const instance = 'tfs.pacific.costcotravel.com';
  const collection = 'TestAutomation';
  const pat = 'aHVudGVyLnJvY2hhQGNvc3Rjb3RyYXZlbC5jb206bnhmenF5Z2R1em5sdHl1c3h1NjdrbGNsZW4zb3c1emVpbGhpeHZra3BqNGc3bmtpY3p0cQ==';

  if (!instance || !collection || !pat) {
    throw new Error('Missing TFS_INSTANCE, TFS_COLLECTION, or TFS_PAT in environment variables.');
  }

  const encodedPAT = Buffer.from(`:${pat}`).toString('base64');

  const url = `https://${instance}/tfs/${collection}/_apis/teams?api-version=4.1-preview.2`;

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

    return response.data.value as Team[];
  } catch (error: any) {
    console.error('Error fetching teams:', error.message);
    throw error;
  }
};
