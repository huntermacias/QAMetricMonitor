// app/api/tfs/getWorkItem/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get('id');

  if (!idParam) {
    return NextResponse.json({ error: 'Work item ID is required.' }, { status: 400 });
  }

  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid work item ID.' }, { status: 400 });
  }

  const tfsBaseUrl =
    process.env.TFS_BASE_URL ||
    'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const authToken = process.env.TFS_AUTH_TOKEN;

  if (!authToken) {
    return NextResponse.json({ error: 'TFS_AUTH_TOKEN is not set.' }, { status: 500 });
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`,
  };

  const workItemUrl = `${tfsBaseUrl}/_apis/wit/workitems/626542?api-version=4.1`;
  try {
    const response = await axios.get(workItemUrl, {
      headers,
      httpsAgent,
    });

    const workItem = response.data;

    return NextResponse.json(workItem, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching work item:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
