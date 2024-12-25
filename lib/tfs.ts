// lib/tfs.ts

import { BugMetrics } from '@/types/tfs';
import axios from 'axios';
import https from 'https';

const tfsBaseUrl =
  process.env.TFS_BASE_URL ||
  'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
const authToken = process.env.TFS_AUTH_TOKEN;

if (!authToken) {
  throw new Error('TFS_AUTH_TOKEN is not set.');
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Use with caution in production
});

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Basic ${authToken}`,
};

/**
 * Executes a WIQL query and returns work items.
 */
export async function executeWiql(query: string) {
  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`;

  const response = await axios.post(
    wiqlUrl,
    { query },
    { headers, httpsAgent }
  );

  return response.data.workItems;
}

/**
 * Fetches detailed information for a list of work item IDs.
 */
export async function fetchWorkItemDetails(ids: number[]) {
  if (ids.length === 0) return [];

  // List of fields to fetch, including IterationPath
  const fields = [
    'System.Id',
    'System.WorkItemType',
    'System.Title',
    'System.AssignedTo',
    'System.State',
    'System.Tags',
    'System.IterationPath', 
    'System.TeamProject',
    'Microsoft.VSTS.Common.ClosedDate',
    'System.CreatedDate',
    'System.CreatedBy',
    'Microsoft.VSTS.Common.Priority',
  ].join(',');

  const idsChunked = chunkArray(ids, 200); 
  const allDetails = [];

  for (const chunk of idsChunked) {
    const idsString = chunk.join(',');
    const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems?ids=${idsString}&fields=${fields}&api-version=4.1`;

    try {
      const response = await axios.get(detailUrl, { headers, httpsAgent });
      if (response.data?.value?.length) {
        allDetails.push(...response.data.value);
      } else {
        console.warn(`No details found for IDs: ${idsString}`);
      }
    } catch (error: any) {
      console.error(`Error fetching details for IDs ${idsString}:`, error.message);
    }
  }

  return allDetails;
}


/**
 * Compute bug metrics for a given feature.
 */
export async function computeBugMetrics(
  featureId: number,
  relations: any[]
): Promise<BugMetrics> {

  return countBugsForFeature(featureId, relations);
}

/**
 * Utility function to chunk an array into smaller arrays.
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

/**
 * Enhanced countBugsForFeature function to track duration metrics.
 */
export async function countBugsForFeature(
  featureId: number,
  relations: any[],
  tfsBaseUrlOverride?: string,
  headersOverride?: any,
  httpsAgentOverride?: any
): Promise<BugMetrics> {

  const baseUrl = tfsBaseUrlOverride || tfsBaseUrl;
  const hdrs = headersOverride || headers;
  const agent = httpsAgentOverride || httpsAgent;

  let openBugCount = 0;
  let closedBugCount = 0;

  let openBugDurationSum = 0;
  let openBugDurationCount = 0;

  let closedBugDurationSum = 0;
  let closedBugDurationCount = 0;

  // Extract direct child work item IDs
  const childWorkItemIds = relations
    .filter(
      (relation: any) =>
        relation.rel === 'System.LinkTypes.Hierarchy-Forward'
    )
    .map((relation: any) => {
      const urlParts = relation.url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    });

  if (childWorkItemIds.length === 0) {
    return {
      openBugCount,
      closedBugCount,
      openBugDurationSum,
      openBugDurationCount,
      closedBugDurationSum,
      closedBugDurationCount,
    };
  }

  // Fetch details of child work items
  const childDetails = await fetchWorkItemDetails(childWorkItemIds);

  const validChildDetails = childDetails.filter(
    (item: any) => item !== null
  ) as {
    id: number;
    fields: any;
    relations: any[];
  }[];

  for (const child of validChildDetails) {
    const fields = child.fields;
    const type = fields['System.WorkItemType'];
    const state = fields['System.State'];
    const createdDate = new Date(fields['System.CreatedDate']);
    const closedDate = fields['Microsoft.VSTS.Common.ClosedDate'];
    const changedDate = new Date(fields['System.ChangedDate']);
    const iterationPath = fields['System.IterationPath']

    if (type === 'Bug') {
      const availableStates = ['Active', 'New', 'In Progress', 'Committed', 'Planned'];
      if (availableStates.includes(state)) {
        // Open bug
        openBugCount++;
        const now = new Date();
        const durationDays =
          (now.getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24);
        openBugDurationSum += durationDays;
        openBugDurationCount++;
      } else if (
        [
          'Closed',
          'Resolved',
          'Done',
          'Released',
          'Deployed',
        ].includes(state)
      ) {
        // Closed bug
        closedBugCount++;
        const closeDate = closedDate || changedDate;
        //console.log('closed', closedDate)
        const durationDays =
          (closeDate - createdDate.getTime()) /
          (1000 * 60 * 60 * 24);
        closedBugDurationSum += durationDays;
        closedBugDurationCount++;
      }
    } else {
      // Another work item type, like a sub-feature or task 
      const subMetrics = await countBugsForFeature(
        child.id,
        child.relations,
        baseUrl,
        hdrs,
        agent
      );

      openBugCount += subMetrics.openBugCount;
      closedBugCount += subMetrics.closedBugCount;
      openBugDurationSum += subMetrics.openBugDurationSum;
      openBugDurationCount += subMetrics.openBugDurationCount;
      closedBugDurationSum += subMetrics.closedBugDurationSum;
      closedBugDurationCount += subMetrics.closedBugDurationCount;
    }
  }

  return {
    openBugCount,
    closedBugCount,
    openBugDurationSum,
    openBugDurationCount,
    closedBugDurationSum,
    closedBugDurationCount,
  };
}
