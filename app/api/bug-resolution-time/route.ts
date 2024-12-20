// app/api/bug-resolution-time/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

/**
 * Interface representing the structure of a Bug Work Item.
 */
interface BugWorkItem {
  id: number;
  createdDate: string; // ISO date string
  closedDate: string; // ISO date string
}

/**
 * Interface representing the response structure.
 */
interface BugResolutionResponse {
  averageResolutionTime: number; // in days
}

export async function GET() {
  console.log('Fetching bug resolution time...');
  
  const tfsBaseUrl = process.env.TFS_BASE_URL || 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const authToken = process.env.TFS_AUTH_TOKEN;

  if (!authToken) {
    console.error('TFS_AUTH_TOKEN is not set.');
    return NextResponse.json(
      { error: 'TFS_AUTH_TOKEN is not set.' },
      { status: 500 }
    );
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Use with caution. Only if necessary.
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`,
  };

  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=6.0`;

  const query = {
    query: `
      SELECT [System.Id], [System.CreatedDate], [Microsoft.VSTS.Common.ClosedDate]
      FROM WorkItems
      WHERE [System.WorkItemType] = 'Bug' AND [System.State] = 'Closed'
      ORDER BY [System.CreatedDate] DESC
    `,
  };

  try {
    // Step 1: Execute WIQL query to get bug IDs
    const wiqlResponse = await axios.post(wiqlUrl, query, {
      headers,
      httpsAgent,
    });

    const workItems = wiqlResponse.data.workItems;

    console.log('Fetched Work Items:', workItems);

    if (!workItems || workItems.length === 0) {
      console.log('No closed bugs found.');
      return NextResponse.json({ averageResolutionTime: 0 }, { status: 200 });
    }

    // Step 2: Fetch detailed information for each bug
    const bugDetailsPromises = workItems.map(
      async (item: { id: number; url: string }) => {
        const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${item.id}?$select=System.CreatedDate,Microsoft.VSTS.Common.ClosedDate&api-version=6.0`;

        try {
          const detailResponse = await axios.get(detailUrl, {
            headers,
            httpsAgent,
          });
          const fields = detailResponse.data.fields;

          const bug: BugWorkItem = {
            id: detailResponse.data.id,
            createdDate: fields['System.CreatedDate'],
            closedDate: fields['Microsoft.VSTS.Common.ClosedDate'],
          };

          return bug;
        } catch (error: any) {
          console.error(
            `Error fetching details for bug ${item.id}:`,
            error.response?.data || error.message
          );
          return null;
        }
      }
    );

    const detailedBugs = await Promise.all(bugDetailsPromises);

    // Step 3: Filter out any null results due to fetch errors
    const validBugs = detailedBugs.filter(
      (item): item is BugWorkItem => item !== null
    );

    // Step 4: Calculate resolution times in days
    const resolutionTimes: number[] = validBugs.map((bug) => {
      const createdDate = new Date(bug.createdDate);
      const closedDate = new Date(bug.closedDate);
      const resolutionTime = (closedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24); // in days
      return resolutionTime;
    });

    // Step 5: Calculate average resolution time
    const totalResolutionTime = resolutionTimes.reduce((acc, curr) => acc + curr, 0);
    const averageResolutionTime = resolutionTimes.length > 0 ? totalResolutionTime / resolutionTimes.length : 0;

    console.log(`Average Resolution Time: ${averageResolutionTime.toFixed(2)} days`);

    const response: BugResolutionResponse = {
      averageResolutionTime: parseFloat(averageResolutionTime.toFixed(2)),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error calculating bug resolution time:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * Helper function to fetch work items in batches.
 * (Optional: If you need to handle large batches, you can implement batching logic here)
 */
async function fetchWorkItemsBatch(
  ids: number[],
  fields: string[],
  headers: any,
  httpsAgent: any
) {
  const batchSize = 200;
  const workItems: any[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
    const batchUrl = `${process.env.TFS_BASE_URL}/_apis/wit/workitemsbatch?api-version=6.0`;

    const response = await axios.post(
      batchUrl,
      { ids: batchIds, fields },
      { headers, httpsAgent }
    );

    workItems.push(...response.data.value);
  }

  return workItems;
}
