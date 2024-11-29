// app/api/bug-trends/route.ts

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

  // Define the time frame (e.g., last 6 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Fetch bugs created in the time frame
    const queryCreated = {
      query: `
        SELECT [System.Id], [System.CreatedDate]
        FROM WorkItems
        WHERE [System.WorkItemType] = 'Bug' AND [System.CreatedDate] >= '${startDateString}' AND [System.CreatedDate] <= '${endDateString}'
        ORDER BY [System.CreatedDate] ASC
      `,
    };

    const createdResponse = await axios.post(wiqlUrl, queryCreated, { headers, httpsAgent });
    const createdWorkItems = createdResponse.data.workItems || [];

    // Fetch bugs closed in the time frame
    const queryClosed = {
      query: `
        SELECT [System.Id], [Microsoft.VSTS.Common.ClosedDate]
        FROM WorkItems
        WHERE [System.WorkItemType] = 'Bug' AND [Microsoft.VSTS.Common.ClosedDate] >= '${startDateString}' AND [Microsoft.VSTS.Common.ClosedDate] <= '${endDateString}'
        ORDER BY [Microsoft.VSTS.Common.ClosedDate] ASC
      `,
    };

    const closedResponse = await axios.post(wiqlUrl, queryClosed, { headers, httpsAgent });
    const closedWorkItems = closedResponse.data.workItems || [];

    // Function to aggregate bugs by month
    const aggregateByMonth = (workItems: any[], dateField: string) => {
      const monthlyCounts: Record<string, number> = {};

      workItems.forEach((item) => {
        const dateStr = item.fields[dateField];
        const date = new Date(dateStr);
        const month = date.toISOString().substring(0, 7); // YYYY-MM
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      });

      return monthlyCounts;
    };

    // Fetch details for created bugs
    const createdIds = createdWorkItems.map((item: any) => item.id);
    const createdDetails = await fetchWorkItemsBatch(createdIds, ['System.CreatedDate'], headers, httpsAgent);
    const createdMonthlyCounts = aggregateByMonth(createdDetails, 'System.CreatedDate');

    // Fetch details for closed bugs
    const closedIds = closedWorkItems.map((item: any) => item.id);
    const closedDetails = await fetchWorkItemsBatch(closedIds, ['Microsoft.VSTS.Common.ClosedDate'], headers, httpsAgent);
    const closedMonthlyCounts = aggregateByMonth(closedDetails, 'Microsoft.VSTS.Common.ClosedDate');

    // Generate the list of months in the time frame
    const months = [];
    const date = new Date(startDateString);
    while (date <= new Date(endDateString)) {
      const monthStr = date.toISOString().substring(0, 7);
      months.push(monthStr);
      date.setMonth(date.getMonth() + 1);
    }

    // Build the trends data
    const bugTrends = months.map((month) => ({
      month,
      created: createdMonthlyCounts[month] || 0,
      closed: closedMonthlyCounts[month] || 0,
    }));

    return NextResponse.json(bugTrends, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bug trends:', error.message);
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
