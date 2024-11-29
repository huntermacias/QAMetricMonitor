// app/api/bug-resolution-time/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET() {
  const tfsBaseUrl = process.env.TFS_BASE_URL;
  const authToken = process.env.TFS_AUTH_TOKEN;

  if (!authToken) {
    return NextResponse.json(
      { error: 'TFS_AUTH_TOKEN is not set.' },
      { status: 500 }
    );
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`,
  };

  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`;

  try {
    // Fetch closed bugs
    const query = {
      query: `
        SELECT [System.Id], [System.CreatedDate], [Microsoft.VSTS.Common.ClosedDate]
        FROM WorkItems
        WHERE [System.WorkItemType] = 'Bug' AND [System.State] = 'Closed'
        ORDER BY [System.CreatedDate] DESC
      `,
    };

    const wiqlResponse = await axios.post(wiqlUrl, query, { headers, httpsAgent });
    const workItems = wiqlResponse.data.workItems;

    if (!workItems || workItems.length === 0) {
      return NextResponse.json({ averageResolutionTime: 0 }, { status: 200 });
    }

    // Fetch details of the bugs
    const bugIds = workItems.map((item: any) => item.id);
    const bugs = await fetchWorkItemsBatch(bugIds, ['System.CreatedDate', 'Microsoft.VSTS.Common.ClosedDate'], headers, httpsAgent);

    // Calculate resolution times
    const resolutionTimes: number[] = [];

    bugs.forEach((bug: any) => {
      const createdDateStr = bug.fields['System.CreatedDate'];
      const closedDateStr = bug.fields['Microsoft.VSTS.Common.ClosedDate'];

      if (createdDateStr && closedDateStr) {
        const createdDate = new Date(createdDateStr);
        const closedDate = new Date(closedDateStr);
        const resolutionTime = (closedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24); // in days
        resolutionTimes.push(resolutionTime);
      }
    });

    const averageResolutionTime =
      resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;

    return NextResponse.json({ averageResolutionTime }, { status: 200 });
  } catch (error: any) {
    console.error('Error calculating bug resolution time:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to fetch work items in batches
async function fetchWorkItemsBatch(
  ids: number[],
  fields: string[],
  headers: any,
  httpsAgent: any
) {
  const tfsBaseUrl = process.env.TFS_BASE_URL;
  const batchSize = 200;
  const workItems: any[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    const batchUrl = `${tfsBaseUrl}/_apis/wit/workitemsbatch?api-version=5.1`;

    const response = await axios.post(
      batchUrl,
      { ids: batchIds, fields },
      { headers, httpsAgent }
    );

    workItems.push(...response.data.value);
  }

  return workItems;
}
