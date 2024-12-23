// app/api/tfs/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET() {
  const TFS_BASE_URL = process.env.TFS_BASE_URL || 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const TFS_AUTH_TOKEN = process.env.TFS_AUTH_TOKEN;
  const TIMEOUT = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT, 10) : 120000;

  if (!TFS_AUTH_TOKEN || !TFS_BASE_URL) {
    return NextResponse.json(
      { error: 'Missing TFS_AUTH_TOKEN or TFS_BASE_URL from config.' },
      { status: 500 }
    );
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  const headers = {
    Authorization: `Basic ${TFS_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Step 1: Fetch bug IDs using WIQL
  async function getCompletionTimeForBugs() {
    const url = `${TFS_BASE_URL}/_apis/wit/wiql?api-version=2.0`;
    const query = {
      query: `
        SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags],
               [Microsoft.VSTS.Common.ClosedDate],[System.CreatedDate],[System.CreatedBy],[Microsoft.VSTS.Common.Priority]
        FROM WorkItems 
        WHERE [System.WorkItemType] = 'Bug' 
          AND [System.State] <> 'New' 
          AND [System.State] <> 'Removed'
          AND ([CostcoTravel.Team] contains 'shopping')
          AND [System.CreatedDate] > '2024-06-01'
      `,
    };

    try {
      console.log('Sending WIQL request to TFS...');
      const response = await axios.post(url, query, { headers, httpsAgent, timeout: TIMEOUT });
      if (!response.data || !response.data.workItems) {
        console.error('No work items found:', response.data);
        return [];
      }

      console.log(`Fetched ${response.data.workItems.length} bugs.`);
      return response.data.workItems;
    } catch (error: any) {
      const errorMsg = error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      console.error('Error fetching bugs:', errorMsg);
      return [];
    }
  }

  // Step 2: Fetch detailed fields for given IDs
  async function getWorkItemDetails(ids: number[]) {
    if (ids.length === 0) return [];

    const fields = [
      'System.Id',
      'System.WorkItemType',
      'System.Title',
      'System.AssignedTo',
      'System.State',
      'System.Tags',
      'System.TeamProject',
      'Microsoft.VSTS.Common.ClosedDate',
      'System.CreatedDate',
      'System.CreatedBy',
      'CostcoTravel.Environment',
      'CostcoTravel.ActualEffort',
      'CostcoTravel.Team',
      'Microsoft.VSTS.Common.Priority',
    ].join(',');

    const idList = ids.join(',');
    const url = `${TFS_BASE_URL}/_apis/wit/workitems?ids=${idList}&fields=${fields}&api-version=2.0`;

    console.log(`Fetching details for ${ids.length} work items...`);
    const response = await axios.get(url, { headers, httpsAgent, timeout: TIMEOUT });
    if (!response.data || !response.data.value || response.data.value.length === 0) {
      console.error('No work item details found.');
      return [];
    }

    console.log(`Fetched details for ${response.data.value.length} work items.`);
    return response.data.value;
  }

  // Calculate total time open for each bug
  function getTotalTimeOpen(bugDetails: any[]) {
    return bugDetails.map((bug) => {
      const createdDate = new Date(bug.fields['System.CreatedDate']);
      const closedDate = new Date(bug.fields['Microsoft.VSTS.Common.ClosedDate']);
      const timeDiff = closedDate.getTime() - createdDate.getTime();
      const timeDiffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const timeDiffHours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const totalHoursOpen = timeDiffDays * 24 + timeDiffHours;
      return {
        bugId: bug.id,
        totalHoursOpen,
        timeDiffDays,
        timeDiffHours,
      };
    });
  }

  // Build user metrics
  function buildUserMetrics(bugDetails: any[]) {
    const userMap: Record<string, any> = [];

    bugDetails.forEach((bug) => {
      const assignedTo = bug.fields['System.AssignedTo'] || 'Unassigned';
      const team = bug.fields['CostcoTravel.Team'];
      const name = assignedTo.split('<')[0].trim();
      const bugId = bug.id;

      if (!userMap[name]) {
        userMap[name] = {
          name: name,
          totalBugs: 0,
          totalEffort: 0,
          bugIds: [],
          averageEffort: 0,
          team,
        };
      }

      const effort = parseInt(bug.fields['CostcoTravel.ActualEffort'], 10) || 0;
      userMap[name].totalBugs += 1;
      userMap[name].totalEffort += effort;
      userMap[name].averageEffort = userMap[name].totalEffort / userMap[name].totalBugs;
      userMap[name].bugIds.push(bugId);
    });

    console.log('User Metrics:', userMap);
    return userMap;
  }

  try {
    const bugs = await getCompletionTimeForBugs();
    if (bugs.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Limit to first 200 for performance
    const bugIds = bugs.map((bug: any) => bug.id).slice(0, 200);
    const bugDetails = await getWorkItemDetails(bugIds);

    const timeOpenStats = getTotalTimeOpen(bugDetails);
    const userMetrics = buildUserMetrics(bugDetails);

    // Combine results into a single object
    const result = {
      bugCount: bugDetails.length,
      timeOpenStats,
      userMetrics,
      bugDetails,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error during bug retrieval:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
