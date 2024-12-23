// app/api/bugs-per-feature/route.ts

import { computeBugMetrics, executeWiql, fetchWorkItemDetails } from '@/lib/tfs';
import {  WorkItem } from '@/types/tfs';
import { NextRequest, NextResponse } from 'next/server';


interface FeatureBugMetrics {
  featureId: number;
  featureTitle: string;
  openBugCount: number;
  closedBugCount: number;
  averageOpenBugAgeDays: number | null;
  averageClosedBugLifetimeDays: number | null;
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

  const query = `
    SELECT [System.Id], [System.Title]
    FROM WorkItems
    WHERE [System.WorkItemType] = 'Feature'
      AND [System.State] IN ('Planned', 'In Progress', 'Released', 'Deployed', 'Committed')
      AND [CostcoTravel.Team] CONTAINS 'Shopping Team'
      AND [System.CreatedDate] > '2024-01-01'
    ORDER BY [System.ChangedDate] DESC
  `;

  try {
    // Step 1: Execute WIQL query to get feature IDs
    const workItems: { id: number; url: string }[] = await executeWiql(query);

    if (!workItems || workItems.length === 0) {
      console.log('No features found.');
      return NextResponse.json([], { status: 200 });
    }

    const featureIds = workItems.map((item) => item.id);

    // Step 2: Fetch detailed information for each feature
    const detailedFeaturesRaw = await fetchWorkItemDetails(featureIds);

    const validFeatures: WorkItem[] = detailedFeaturesRaw
      .filter((item: any) => item !== null)
      .map((item: any) => ({
        id: item.id,
        title: item.fields['System.Title'],
        relations: item.relations || [],
      }));

    // Step 3: For each feature, compute bug metrics
    const bugMetricsPromises = validFeatures.map(async (feature) => {
      const bugMetrics = await computeBugMetrics(
        feature.id,
        feature.relations
      );

      const {
        openBugCount,
        closedBugCount,
        openBugDurationSum,
        openBugDurationCount,
        closedBugDurationSum,
        closedBugDurationCount,
      } = bugMetrics;

      const averageOpenBugAgeDays =
        openBugDurationCount > 0
          ? openBugDurationSum / openBugDurationCount
          : null;

      const averageClosedBugLifetimeDays =
        closedBugDurationCount > 0
          ? closedBugDurationSum / closedBugDurationCount
          : null;

      const featureBugMetrics: FeatureBugMetrics = {
        featureId: feature.id,
        featureTitle: feature.title,
        openBugCount,
        closedBugCount,
        averageOpenBugAgeDays,
        averageClosedBugLifetimeDays,
      };

      return featureBugMetrics;
    });

    const bugCountsPerFeature: FeatureBugMetrics[] = await Promise.all(
      bugMetricsPromises
    );

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
