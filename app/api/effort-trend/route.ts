// app/api/effort-trend/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

/**
 * Interface representing the structure of a Task with Efforts.
 */
interface TaskEffort {
  taskId: number;
  taskTitle: string;
  sizingEffort: number; // e.g., Story Points
  actualEffort: number; // e.g., Hours
}

/**
 * API Route Handler for fetching Task Effort Trends.
 */
export async function GET() {
  console.log('Fetching task effort trends...');

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
      SELECT [System.Id], [System.Title], [Microsoft.VSTS.Scheduling.Effort], [CostcoTravel.ActualEffort]
      FROM WorkItems
      WHERE [System.WorkItemType] = 'Task'
        AND [System.State] IN ('Completed', 'Closed', 'Resolved', 'Done')
        AND [System.CreatedDate] > '2024-01-01'
      ORDER BY [System.ChangedDate] DESC
    `,
  };

  try {
    // Step 1: Execute WIQL query to get task IDs
    const wiqlResponse = await axios.post(wiqlUrl, query, {
      headers,
      httpsAgent,
    });

    const workItems = wiqlResponse.data.workItems;

    console.log('Fetched Work Items:', workItems);

    if (!workItems || workItems.length === 0) {
      console.log('No tasks found.');
      return NextResponse.json([], { status: 200 });
    }

    // Step 2: Fetch detailed information for each task
    const taskDetailsPromises = workItems.map(
      async (item: { id: number; url: string }) => {
        const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${item.id}?$select=System.Id,System.Title,Microsoft.VSTS.Scheduling.Effort,CostcoTravel.ActualEffort&api-version=6.0`;

        try {
          const detailResponse = await axios.get(detailUrl, {
            headers,
            httpsAgent,
          });
          const fields = detailResponse.data.fields;

          console.log('Fetched Fields for Task:', fields);

          const task: TaskEffort = {
            taskId: detailResponse.data.id,
            taskTitle: fields['System.Title'],
            sizingEffort: fields['Microsoft.VSTS.Scheduling.Effort'] || 0, // Ensure default value
            actualEffort: fields['CostcoTravel.ActualEffort'] || 0, // Ensure default value
          };

          return task;
        } catch (error: any) {
          console.error(
            `Error fetching details for task ${item.id}:`,
            error.response?.data || error.message
          );
          return null;
        }
      }
    );

    const detailedTasks = await Promise.all(taskDetailsPromises);

    // Step 3: Filter out any null results due to fetch errors
    const validTasks = detailedTasks.filter(
      (item): item is TaskEffort => item !== null
    );

    console.log(`Fetched ${validTasks.length} tasks with effort data.`);

    return NextResponse.json(validTasks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching task efforts:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
