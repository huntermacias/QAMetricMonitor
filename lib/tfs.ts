// lib/tfs.ts

import axios from 'axios';

const tfsBaseUrl = process.env.TFS_BASE_URL;
const authToken = process.env.TFS_AUTH_TOKEN;

if (!tfsBaseUrl) {
  throw new Error('TFS_BASE_URL is not set in environment variables.');
}

if (!authToken) {
  throw new Error('TFS_AUTH_TOKEN is not set in environment variables.');
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${authToken}`,
};

export interface WorkItem {
  id: number;
  state: string;
  title: string;
  type: string;
  effort: string;
  assignedTo: string;
  team: string;
  description: string;
}

// Function to fetch work items based on WIQL query
export async function getWorkItems(): Promise<number[]> {
  const url = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`;
  const query = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE [System.WorkItemType] IN ('Feature', 'User Story', 'Bug', 'Task') 
        AND [System.State] IN ('Done', 'In Progress', 'Committed', 'New', 'Active') 
        AND [CostcoTravel.Team] CONTAINS 'Shopping Team' 
        AND [System.CreatedDate] > '2024-06-01'
      ORDER BY [System.ChangedDate] DESC
    `,
  };

  try {
    const response = await axios.post(url, query, { headers });
    const featureIds: number[] = response.data.workItems.map((item: any) => item.id);
    return featureIds;
  } catch (error: any) {
    console.error('Error fetching work items:', error.response?.data || error.message);
    throw new Error('Failed to fetch work items.');
  }
}

// Function to fetch details of each work item
export async function getWorkItemDetails(id: number): Promise<WorkItem | null> {
  const url = `${tfsBaseUrl}/_apis/wit/workitems/${id}?$expand=All&api-version=1.0`;

  try {
    const response = await axios.get(url, { headers });
    const feature = response.data;

    return {
      id: feature.id,
      state: feature.fields['System.State'],
      title: feature.fields['System.Title'],
      type: feature.fields['System.WorkItemType'],
      effort:
        feature.fields['Microsoft.VSTS.Scheduling.Effort'] ||
        feature.fields['Microsoft.VSTS.Scheduling.OriginalEstimate'] ||
        '',
      assignedTo: feature.fields['System.AssignedTo']
        ? extractDisplayName(feature.fields['System.AssignedTo'].displayName)
        : 'Unassigned',
      team: feature.fields['CostcoTravel.Team'] || '',
      description: feature.fields['System.Description'] || '',
    };
  } catch (error: any) {
    console.error(`Error fetching details for work item ${id}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to extract display name from assignedTo field
function extractDisplayName(assignedTo: string): string {
  if (typeof assignedTo !== 'string') return 'Unassigned';
  const match = assignedTo.match(/^(.*?)\s*<.*?>$/);
  return match ? match[1] : assignedTo;
}
