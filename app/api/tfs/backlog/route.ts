import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

/**
 * Fetch backlog items dynamically for all Shopping Portfolio teams (Teams 1-8).
 */
export async function GET(request: NextRequest) {
  const TFS_BASE_URL = process.env.TFS_BASE_URL || 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const authToken = process.env.TFS_AUTH_TOKEN;

  if (!authToken) {
    return NextResponse.json(
      { error: 'TFS_AUTH_TOKEN is not set in the environment variables.' },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Basic ${authToken}`,
    'Content-Type': 'application/json',
  };

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    // Step 1: Fetch all teams
    const teamsUrl = `${TFS_BASE_URL}/_apis/teams?api-version=4.1-preview.2`;
    const teamsResponse = await axios.get(teamsUrl, {
      headers,
      httpsAgent,
    });

    if (!teamsResponse.data.value || teamsResponse.data.value.length === 0) {
      console.error('No teams found.');
      return NextResponse.json(
        { error: 'No teams found in the Shopping Portfolio.' },
        { status: 404 }
      );
    }

    // Filter only Shopping Portfolio teams (1-8)
    const shoppingTeams = teamsResponse.data.value.filter((team: any) =>
      team.name.match(/Shopping Team/)
    );

    if (shoppingTeams.length === 0) {
      return NextResponse.json(
        { error: 'No Shopping Portfolio teams found.' },
        { status: 404 }
      );
    }

    // Step 2: Fetch backlog items for each team
    const backlogPromises = shoppingTeams.map(async (team: any) => {
      const backlogUrl = `${TFS_BASE_URL}/${team.projectName}/${team.id}/_apis/work/backlogs?api-version=4.1-preview.1`;

      try {
        const response = await axios.get(backlogUrl, {
          headers,
          httpsAgent,
        });

        return {
          teamName: team.name,
          backlog: response.data,
        };
      } catch (error: any) {
        console.error(`Error fetching backlog for ${team.name}:`, error.message);
        return { teamName: team.name, error: error.message };
      }
    });

    const backlogs = await Promise.all(backlogPromises);

    return NextResponse.json(backlogs, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching backlogs:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
