// app/api/tfs/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { WorkItem } from '../../../interfaces/WorkItem';


function extractDisplayName(displayName: string): string {
  if (typeof displayName !== 'string') return 'Unassigned';
  const match = displayName.match(/^(.*?)\s*<.*?>$/);
  return match ? match[1] : displayName;
}

export async function GET() {
  const tfsBaseUrl = process.env.TFS_BASE_URL || 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';
  const authToken = process.env.TFS_AUTH_TOKEN;

  console.log('TFS Base URL:', tfsBaseUrl);
  console.log('TFS Auth Token Present:', authToken ? 'Yes' : 'No');

  if (!authToken) {
    return NextResponse.json({ error: 'TFS_AUTH_TOKEN is not set.' }, { status: 500 });
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Use with caution. Only if necessary.
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authToken}`,
  };

  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`;
  const query = {
    query: `
      SELECT [System.Id]
      FROM WorkItems
      WHERE [System.WorkItemType] IN ('Feature', 'User Story', 'Bug', 'Task') 
        AND [System.State] IN ('Done', 'In Progress', 'Committed', 'New', 'Active') 
        AND [CostcoTravel.Team] CONTAINS 'Shopping Team' 
        AND [System.CreatedDate] > '2024-12-01'
      ORDER BY [System.ChangedDate] DESC
    `,
  };

  try {
    // Step 1: Execute WIQL query to get work item IDs
    const wiqlResponse = await axios.post(wiqlUrl, query, {
      headers,
      httpsAgent,
    });

    const workItems = wiqlResponse.data.workItems;

    //console.log('Retrieved Work Items:', workItems);

    if (!workItems || workItems.length === 0) {
      console.log('No work items found.');
      return NextResponse.json([], { status: 200 });
    }

    // Step 2: Fetch detailed information for each work item
    const workItemDetailsPromises = workItems.map(async (item: { id: number; url: string }) => {
      const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${item.id}?$expand=All&api-version=1.0`;

      try {
        const detailResponse = await axios.get(detailUrl, { headers, httpsAgent });
        const fields = detailResponse.data.fields;

        const workItem: WorkItem = {
          id: detailResponse.data.id,
          url: detailResponse.data.url,
          system: {
            Id: fields['System.Id'],
            AreaId: fields['System.AreaId'],
            AreaPath: fields['System.AreaPath'],
            TeamProject: fields['System.TeamProject'],
            NodeName: fields['System.NodeName'],
            AreaLevel1: fields['System.AreaLevel1'],
            AreaLevel2: fields['System.AreaLevel2'],
            AreaLevel3: fields['System.AreaLevel3'],
            AreaLevel4: fields['System.AreaLevel4'],
            Rev: fields['System.Rev'],
            AuthorizedDate: fields['System.AuthorizedDate'],
            RevisedDate: fields['System.RevisedDate'],
            IterationId: fields['System.IterationId'],
            IterationPath: fields['System.IterationPath'],
            IterationLevel1: fields['System.IterationLevel1'],
            IterationLevel2: fields['System.IterationLevel2'],
            IterationLevel3: fields['System.IterationLevel3'],
            IterationLevel4: fields['System.IterationLevel4'],
            WorkItemType: fields['System.WorkItemType'],
            State: fields['System.State'],
            Reason: fields['System.Reason'],
            AssignedTo: fields['System.AssignedTo']
              ? extractDisplayName(fields['System.AssignedTo'].displayName)
              : 'Unassigned',
            CreatedDate: fields['System.CreatedDate'],
            CreatedBy: fields['System.CreatedBy'],
            ChangedDate: fields['System.ChangedDate'],
            ChangedBy: fields['System.ChangedBy'],
            AuthorizedAs: fields['System.AuthorizedAs'],
            PersonId: fields['System.PersonId'],
            Watermark: fields['System.Watermark'],
            Title: fields['System.Title'],
            BoardColumn: fields['System.BoardColumn'],
            BoardColumnDone: fields['System.BoardColumnDone'],
          },
          microsoftVSTSCommon: {
            ClosedDate: fields['Microsoft.VSTS.Common.ClosedDate'],
            BacklogPriority: fields['Microsoft.VSTS.Common.BacklogPriority'],
          },
          microsoftVSTSCMMI: {
            Blocked: fields['Microsoft.VSTS.CMMI.Blocked'],
          },
          microsoftVSTSCommonScheduling: {
            Effort: fields['Microsoft.VSTS.Scheduling.Effort'],
          },
          costcoTravel: {
            CollectedFromName: fields['CostcoTravel.CollectedFromName'],
            ResourceQA: fields['CostcoTravel.ResourceQA'],
            CostOfDelay: fields['CostcoTravel.CostOfDelay'],
            ActualEffort: fields['CostcoTravel.ActualEffort'],
            WSJF: fields['CostcoTravel.WSJF'],
            Team: fields['CostcoTravel.Team'],
            Iteration: fields['CostcoTravel.Iteration'],
            QAConfiguration: fields['CostcoTravel.QAConfiguration'],
            Area: fields['CostcoTravel.Area'],
          },
          wef: [
            {
              systemExtensionMarker: fields['WEF_6E35FD5BE74648CB8718B488BFB4DDAB_System.ExtensionMarker'],
              kanbanColumn: fields['WEF_6E35FD5BE74648CB8718B488BFB4DDAB_Kanban.Column'],
              kanbanColumnDone: fields['WEF_6E35FD5BE74648CB8718B488BFB4DDAB_Kanban.Column.Done'],
            },
            {
              systemExtensionMarker: fields['WEF_7312F901F6D14BB680AB763453E511F2_System.ExtensionMarker'],
              kanbanColumn: fields['WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column'],
              kanbanColumnDone: fields['WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column.Done'],
            },
            {
              systemExtensionMarker: fields['WEF_EFD4DBC451C347F89611BF2B351D5F1E_System.ExtensionMarker'],
              kanbanColumn: fields['WEF_EFD4DBC451C347F89611BF2B351D5F1E_Kanban.Column'],
              kanbanColumnDone: fields['WEF_EFD4DBC451C347F89611BF2B351D5F1E_Kanban.Column.Done'],
            },
          ],
          systemDescription: fields['System.Description'],
        };

        return workItem;
      } catch (error: any) {
        //console.error(`Error fetching details for work item ${item.id}:`, error.response?.data || error.message);
        return null; // Return null if there's an error fetching this work item
      }
    });

    const detailedWorkItems = await Promise.all(workItemDetailsPromises);

    // Step 3: Filter out any null results due to fetch errors
    const validWorkItems: WorkItem[] = detailedWorkItems.filter((item): item is WorkItem => item !== null);

    //console.log('Valid Work Items:', validWorkItems);

    return NextResponse.json(validWorkItems, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching work items:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data || error.message }, { status: error.response?.status || 500 });
  }
}



