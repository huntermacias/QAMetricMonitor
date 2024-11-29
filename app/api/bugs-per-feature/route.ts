// app/api/bugs-per-feature/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

interface FeatureBugCount {
  featureId: number;
  featureTitle: string;
  openBugCount: number;
  closedBugCount: number;
}

export async function GET() {
  const tfsBaseUrl =
    process.env.TFS_BASE_URL ||
    'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const authToken = process.env.TFS_AUTH_TOKEN;

  if (!authToken) {
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

  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`;

  const query = {
    query: `
      SELECT [System.Id], [System.Title]
      FROM WorkItems
      WHERE [System.WorkItemType] = 'Feature'
        AND [System.State] IN ('Planned', 'In Progress', 'Released', 'Deployed', 'Committed')
        AND [CostcoTravel.Team] CONTAINS 'Shopping Team'
        AND [System.CreatedDate] > '2024-01-01'
      ORDER BY [System.ChangedDate] DESC
    `,
  };

  try {
    // Step 1: Execute WIQL query to get feature IDs
    const wiqlResponse = await axios.post(wiqlUrl, query, {
      headers,
      httpsAgent,
    });

    const workItems = wiqlResponse.data.workItems;

    if (!workItems || workItems.length === 0) {
      console.log('No features found.');
      return NextResponse.json([], { status: 200 });
    }

    // Step 2: Fetch detailed information for each feature
    const featureDetailsPromises = workItems.map(
      async (item: { id: number; url: string }) => {
        const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${item.id}?$expand=Relations&api-version=1.0`;

        try {
          const detailResponse = await axios.get(detailUrl, {
            headers,
            httpsAgent,
          });
          const fields = detailResponse.data.fields;

          const feature = {
            id: detailResponse.data.id,
            title: fields['System.Title'],
            relations: detailResponse.data.relations || [],
          };

          return feature;
        } catch (error: any) {
          console.error(
            `Error fetching details for feature ${item.id}:`,
            error.response?.data || error.message
          );
          return null;
        }
      }
    );

    const detailedFeatures = await Promise.all(featureDetailsPromises);

    // Step 3: Filter out any null results due to fetch errors
    const validFeatures = detailedFeatures.filter(
      (item): item is { id: number; title: string; relations: any[] } =>
        item !== null
    );

    // Step 4: For each feature, count the number of associated bugs
    const bugCountPromises = validFeatures.map(async (feature) => {
      const bugCounts = await countBugsForFeature(
        feature.id,
        feature.relations,
        tfsBaseUrl,
        headers,
        httpsAgent
      );

      const featureBugCount: FeatureBugCount = {
        featureId: feature.id,
        featureTitle: feature.title,
        openBugCount: bugCounts.openBugCount,
        closedBugCount: bugCounts.closedBugCount,
      };

      return featureBugCount;
    });

    const bugCountsPerFeature = await Promise.all(bugCountPromises);

    return NextResponse.json(bugCountsPerFeature, { status: 200 });
  } catch (error: any) {
    console.error(
      'Error fetching bug counts per feature:',
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

// Updated countBugsForFeature function
async function countBugsForFeature(
  featureId: number,
  relations: any[],
  tfsBaseUrl: string,
  headers: any,
  httpsAgent: any
): Promise<{ openBugCount: number; closedBugCount: number }> {
  let openBugCount = 0;
  let closedBugCount = 0;

  // Get direct child work item IDs
  const childWorkItemIds = relations
    .filter((relation: any) => relation.rel === 'System.LinkTypes.Hierarchy-Forward')
    .map((relation: any) => {
      const urlParts = relation.url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    });

  if (childWorkItemIds.length === 0) {
    return { openBugCount, closedBugCount };
  }

  // Fetch details of child work items
  const childDetailsPromises = childWorkItemIds.map(async (childId: number) => {
    const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${childId}?$expand=Relations&api-version=1.0`;

    try {
      const response = await axios.get(detailUrl, {
        headers,
        httpsAgent,
      });
      const fields = response.data.fields;
      return {
        id: response.data.id,
        type: fields['System.WorkItemType'],
        state: fields['System.State'],
        relations: response.data.relations || [],
      };
    } catch (error: any) {
      console.error(
        `Error fetching details for child work item ${childId}:`,
        error.response?.data || error.message
      );
      return null;
    }
  });

  const childDetails = await Promise.all(childDetailsPromises);
  const validChildDetails = childDetails.filter((item) => item !== null);

  for (const child of validChildDetails) {
    if (child.type === 'Bug') {
      // Check if the bug is open or closed based on its state
      if (['Active', 'New', 'In Progress', 'Committed', 'Planned'].includes(child.state)) {
        openBugCount++;
      } else if (['Closed', 'Resolved', 'Done', 'Released', 'Deployed'].includes(child.state)) {
        closedBugCount++;
      }
    } else {
      // Recursively count bugs under this child work item
      const subfeatureBugCounts = await countBugsForFeature(
        child.id,
        child.relations,
        tfsBaseUrl,
        headers,
        httpsAgent
      );
      openBugCount += subfeatureBugCounts.openBugCount;
      closedBugCount += subfeatureBugCounts.closedBugCount;
    }
  }

  return { openBugCount, closedBugCount };
}
