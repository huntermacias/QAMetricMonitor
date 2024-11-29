// app/api/reopened-bugs-rate/route.ts

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
    // Fetch all bugs
    const query = {
      query: `
        SELECT [System.Id]
        FROM WorkItems
        WHERE [System.WorkItemType] = 'Bug'
      `,
    };

    const wiqlResponse = await axios.post(wiqlUrl, query, { headers, httpsAgent });
    const workItems = wiqlResponse.data.workItems;

    if (!workItems || workItems.length === 0) {
      return NextResponse.json({ reopenedBugsRate: 0 }, { status: 200 });
    }

    const bugIds = workItems.map((item: any) => item.id);

    // Fetch revisions for each bug to detect if it was reopened
    const batchSize = 50;
    let reopenedCount = 0;

    for (let i = 0; i < bugIds.length; i += batchSize) {
      const batchIds = bugIds.slice(i, i + batchSize);

      const revisionsPromises = batchIds.map(async (id: number) => {
        const revisionsUrl = `${tfsBaseUrl}/_apis/wit/workitems/${id}/revisions?api-version=5.1`;

        const response = await axios.get(revisionsUrl, { headers, httpsAgent });
        const revisions = response.data.value;

        let closed = false;
        let reopened = false;

        for (const revision of revisions) {
          const state = revision.fields['System.State'];
          if (state === 'Closed' && !closed) {
            closed = true;
          } else if (state !== 'Closed' && closed) {
            reopened = true;
            break;
          }
        }

        return reopened ? 1 : 0;
      });

      const results = await Promise.all(revisionsPromises);
      reopenedCount += results.reduce((sum, val) => sum + val, 0);
    }

    const totalBugsCount = bugIds.length;
    const reopenedBugsRate = (reopenedCount / totalBugsCount) * 100;

    return NextResponse.json({ reopenedBugsRate }, { status: 200 });
  } catch (error: any) {
    console.error('Error calculating reopened bugs rate:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
