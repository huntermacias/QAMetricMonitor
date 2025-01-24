import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Load environment variables

if (!process.env.TFS_BASE_URL || !process.env.TFS_AUTH_TOKEN) {
  console.error('Missing TFS_URL or TFS_AUTH in environment. Please set them.');
}

const TFS_AUTH = process.env.TFS_AUTH_TOKEN as string;
const TFS_URL = process.env.TFS_BASE_URL as string;
const TFS_TIMEOUT = parseInt(process.env.TFS_TIMEOUT || '120000', 10);

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Executes a WIQL query in TFS and returns the list of work items.
 */
async function runWiqlQuery(queryString: string) {
  try {
    const response = await axios.post(
      `${TFS_URL}/_apis/wit/wiql?api-version=2.0`,
      { query: queryString },
      {
        headers: { Authorization: `Basic ${TFS_AUTH}` },
        httpsAgent,
        timeout: TFS_TIMEOUT,
      }
    );

    if (!response.data.workItems) {
      console.log('No work items found for this query.');
      return [];
    }

    console.log('All results from runWiqlQuery:\n', JSON.stringify(response.data.workItems, null, 2));
    return response.data.workItems;
  } catch (err: any) {
    console.error('Error running WIQL query:', err.message);
    throw err;
  }
}

/**
 * Fetches detailed information for a single work item.
 */
async function getWorkItemDetails(workItemId: string) {
  try {
    const url = `${TFS_URL}/_apis/wit/workitems/${workItemId}?fields=System.Title,System.State,System.WorkItemType&api-version=1.0`;
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${TFS_AUTH}` },
      httpsAgent,
      timeout: TFS_TIMEOUT,
    });

    return {
      id: workItemId,
      title: response.data.fields['System.Title'],
      state: response.data.fields['System.State'],
      type: response.data.fields['System.WorkItemType'],
    };
  } catch (error: any) {
    console.error(`Error fetching work item ${workItemId}:`, error.message);
    return null;
  }
}

/**
 * Fetches child work item IDs for a given work item.
 */
async function getChildWorkItemIds(workItemId: string) {
  try {
    const url = `${TFS_URL}/_apis/wit/workitems/${workItemId}?$expand=relations&api-version=1.0`;
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${TFS_AUTH}` },
      httpsAgent,
      timeout: TFS_TIMEOUT,
    });

    const relations = response.data.relations || [];
    const childItems = relations.filter((r: any) => r.rel === 'System.LinkTypes.Hierarchy-Forward');
    return childItems.map((r: any) => r.url.split('/').pop());
  } catch (error: any) {
    console.error(`Error fetching child items for ${workItemId}:`, error.message);
    return [];
  }
}

// API Route Handler
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT [System.Id], [System.Title], [System.State], [System.Tags]
      FROM WorkItems
      WHERE [System.Tags] CONTAINS '#FoundByShoppingCRT'
    `;

    console.log('Executing WIQL query...');
    const results = await runWiqlQuery(query);

    // Fetch details for each work item
    const workItemDetails = await Promise.all(
      results.map(async (item: any) => await getWorkItemDetails(item.id))
    );

    return NextResponse.json({ workItems: workItemDetails }, { status: 200 });
  } catch (error: any) {
    console.error('Error in API route:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}

