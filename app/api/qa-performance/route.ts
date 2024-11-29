// app/api/qa-performance/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

function extractDisplayName(displayName: string): string {
  if (typeof displayName !== 'string') return 'Unassigned';
  const match = displayName.match(/^(.*?)\s*<.*?>$/);
  return match ? match[1] : displayName;
}

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
    // Fetch bugs and test cases assigned to QA team members
    const query = {
      query: `
        SELECT [System.Id], [System.WorkItemType], [System.AssignedTo]
        FROM WorkItems
        WHERE [System.WorkItemType] IN ('Bug', 'Test Case')
      `,
    };

    const wiqlResponse = await axios.post(wiqlUrl, query, { headers, httpsAgent });
    const workItems = wiqlResponse.data.workItems;

    if (!workItems || workItems.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    // Fetch details of the work items
    const itemIds = workItems.map((item: any) => item.id);
    const fields = ['System.Id', 'System.AssignedTo', 'System.WorkItemType'];
    const items = await fetchWorkItemsBatch(itemIds, fields, headers, httpsAgent);

    // Aggregate data per QA member
    const qaPerformance: Record<string, { bugsFound: number; testCasesAuthored: number }> = {};

    items.forEach((item: any) => {
      const assignedToField = item.fields['System.AssignedTo'];
      const assignedTo = assignedToField ? extractDisplayName(assignedToField.displayName) : 'Unassigned';
      const workItemType = item.fields['System.WorkItemType'];

      if (!qaPerformance[assignedTo]) {
        qaPerformance[assignedTo] = { bugsFound: 0, testCasesAuthored: 0 };
      }

      if (workItemType === 'Bug') {
        qaPerformance[assignedTo].bugsFound += 1;
      } else if (workItemType === 'Test Case') {
        qaPerformance[assignedTo].testCasesAuthored += 1;
      }
    });

    return NextResponse.json(qaPerformance, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching QA performance metrics:', error.message);
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
