import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

/**
 * Fetch all teams in the shopping portfolio (Teams 1-8)
 * URL: https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/teams?api-version=4.1-preview.2
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
    const url = `${TFS_BASE_URL}/_apis/teams?api-version=4.1-preview.2`;

    console.log('Fetching teams from TFS:', url);

    // Make API request
    const response = await axios.get(url, {
      headers,
      httpsAgent,
    });

    if (response.status !== 200 || !response.data.value) {
      console.error('Unexpected response from TFS:', response.data);
      return NextResponse.json(
        { error: 'Failed to fetch teams from TFS.' },
        { status: response.status }
      );
    }

    // Filter teams based on Shopping Portfolio (if applicable)
    const shoppingTeams = response.data.value.filter((team: any) =>
      team.name.match(/Shopping Team/)
    );

    return NextResponse.json(shoppingTeams, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching teams from TFS:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.response?.status || 500 }
    );
  }
}
