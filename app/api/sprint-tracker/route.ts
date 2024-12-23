// app/api/sprint-tracker/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { SprintDetail } from '@/types/tfs'; // Ensure correct import path

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

  // Step 1: Execute WIQL Query
  async function executeSprintWIQL() {
    const wiqlUrl = `${TFS_BASE_URL}/_apis/wit/wiql?api-version=2.0`;
    const query = {
      query: `
        SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM WorkItems  WHERE [System.WorkItemType] = 'Feature'
      AND [System.State] IN ('Planned', 'In Progress', 'Released', 'Deployed', 'Committed')
      AND [CostcoTravel.Team] CONTAINS 'Shopping Team'
      AND [System.CreatedDate] > '2024-01-01'
      `,
    };

    try {
      console.log('Sending WIQL request to TFS...');
      const response = await axios.post(wiqlUrl, query, { headers, httpsAgent, timeout: TIMEOUT });
      
      if (!response.data || !response.data.workItems) {
        console.error('No work items found:', response.data);
        return [];
      }

      console.log(`Fetched ${response.data.workItems.length} work items from WIQL.`);
      return response.data.workItems;
    } catch (error: any) {
      const errorMsg = error.response
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      console.error('Error executing WIQL:', errorMsg);
      throw new Error(`WIQL Execution Failed: ${errorMsg}`);
    }
  }

  // Step 2: Fetch Work Item Details
  async function fetchWorkItemDetails(ids: number[]) {
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
      'Microsoft.VSTS.Common.Priority',
    ].join(',');

    const chunks = chunkArray(ids, 200); // TFS API limit per request

    const allDetails: any[] = [];

    for (const chunk of chunks) {
      const idsString = chunk.join(',');
      const detailUrl = `${TFS_BASE_URL}/_apis/wit/workitems?ids=${idsString}&fields=${fields}&api-version=6.0`;
        console.log('try me', detailUrl)
      try {
        //console.log(`Fetching details for work items: ${idsString}`);
        const response = await axios.get(detailUrl, { headers, httpsAgent, timeout: TIMEOUT });
        
        if (!response.data || !response.data.value || response.data.value.length === 0) {
          console.error('No work item details found for IDs:', idsString);
          continue;
        }

        console.log(`Fetched ${response.data.value.length} work item details.`);
        allDetails.push(...response.data.value);
      } catch (error: any) {
        console.error(`Error fetching work item details for IDs ${idsString}:`, error.message);
        continue; // Continue fetching remaining chunks
      }
    }

    return allDetails;
  }

  // Utility Function: Chunk Array
  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const results: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
    }
    return results;
  }

  try {
    const wiqlResults = await executeSprintWIQL();

    if (wiqlResults.length === 0) {
      console.log('No work items found for the specified sprint.');
      return NextResponse.json([], { status: 200 });
    }

    const workItemIds = wiqlResults.map((item: any) => item.id);
    console.log('Work Item IDs:', workItemIds);

    const detailedWorkItems = await fetchWorkItemDetails(workItemIds);

    if (detailedWorkItems.length === 0) {
      console.log('No detailed work items fetched.');
      return NextResponse.json([], { status: 200 });
    }

    const sprintDetails: SprintDetail[] = detailedWorkItems.map((item: any) => ({
      id: item.fields['System.Id'],
      workItemType: item.fields['System.WorkItemType'],
      title: item.fields['System.Title'],
      assignedTo: item.fields['System.AssignedTo']?.displayName || 'Unassigned',
      state: item.fields['System.State'],
      tags: item.fields['System.Tags'] || '',
      closedDate: item.fields['Microsoft.VSTS.Common.ClosedDate'] || null,
      createdDate: item.fields['System.CreatedDate'] || null,
      createdBy: item.fields['System.CreatedBy']?.displayName || 'Unknown',
      priority: item.fields['Microsoft.VSTS.Common.Priority'] || 'Unassigned',
    }));

    console.log('Sprint Details:', JSON.stringify(sprintDetails, null, 2));

    return NextResponse.json(sprintDetails, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching sprint details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
