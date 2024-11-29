// app/api/bug-severity-priority/route.ts

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

  const query = {
    query: `
      SELECT [System.Id], [System.Title], [Microsoft.VSTS.Common.Severity], [Microsoft.VSTS.Common.Priority]
      FROM WorkItems
      WHERE [System.WorkItemType] = 'Bug'
      ORDER BY [System.CreatedDate] DESC
    `,
  };

  try {
    const wiqlResponse = await axios.post(wiqlUrl, query, { headers, httpsAgent });
    const workItems = wiqlResponse.data.workItems;

    if (!workItems || workItems.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch bug details
    const bugIds = workItems.map((item: any) => item.id);
    const batchUrl = `${tfsBaseUrl}/_apis/wit/workitemsbatch?api-version=5.1`;
    const batchResponse = await axios.post(
      batchUrl,
      { ids: bugIds, fields: ['System.Id', 'System.Title', 'Microsoft.VSTS.Common.Severity', 'Microsoft.VSTS.Common.Priority'] },
      { headers, httpsAgent }
    );

    const bugs = batchResponse.data.value;

    // Calculate distributions
    const severityDistribution: Record<string, number> = {};
    const priorityDistribution: Record<number, number> = {};

    bugs.forEach((bug: any) => {
      const severity = bug.fields['Microsoft.VSTS.Common.Severity'] || 'Undefined';
      const priority = bug.fields['Microsoft.VSTS.Common.Priority'] || 'Undefined';

      severityDistribution[severity] = (severityDistribution[severity] || 0) + 1;
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    });

    return NextResponse.json({ severityDistribution, priorityDistribution }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bug severity and priority:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
