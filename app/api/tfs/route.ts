import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'



// Minimal sub-interfaces for each field group:
interface SystemFields {
  Id: number
  AreaId: number
  AreaPath: string
  TeamProject: string
  NodeName: string
  AreaLevel1: string
  AreaLevel2: string
  AreaLevel3: string
  AreaLevel4: string
  Rev: number
  AuthorizedDate: string // ISO date string
  RevisedDate: string // ISO date string
  IterationId: number
  IterationPath: string
  IterationLevel1: string
  IterationLevel2: string
  IterationLevel3: string
  IterationLevel4: string
  WorkItemType: string
  State: string
  Reason: string
  AssignedTo: string
  CreatedDate: string // ISO date string
  CreatedBy: string
  ChangedDate: string // ISO date string
  ChangedBy: string
  AuthorizedAs: string
  PersonId: number
  Title: string
  BoardColumn: string
  BoardColumnDone: boolean
  // We add tags here so page.tsx can reference system.tags
  tags: string
}

interface MicrosoftVSTSCommonFields {
  ClosedDate?: string
  BacklogPriority?: number
}

interface MicrosoftVSTSCMMIFields {
  Blocked?: string
}

interface MicrosoftVSTSCommonSchedulingFields {
  Effort?: number
}

interface CostcoTravelFields {
  CollectedFromName?: string
  ResourceQA?: string
  CostOfDelay?: number
  ActualEffort?: number
  WSJF?: number
  Team?: string
  Iteration?: string
  QAConfiguration?: string
  Area?: string
}

// We can omit WEF fields if not used in the page, or define them:
interface WEFItem {
  systemExtensionMarker?: string
  kanbanColumn?: string
  kanbanColumnDone?: boolean
}

// Master interface
interface WorkItem {
  id: number
  url: string
  system: SystemFields
  microsoftVSTSCommon: MicrosoftVSTSCommonFields
  microsoftVSTSCMMI: MicrosoftVSTSCMMIFields
  microsoftVSTSCommonScheduling: MicrosoftVSTSCommonSchedulingFields
  costcoTravel: CostcoTravelFields
  wef: WEFItem[]
  systemDescription?: string
}

// ---------------------------------------------
// 2) Helper to parse "Hunter Macias <PACIFIC\\hunter.macias>" => "Hunter Macias"
// ---------------------------------------------
function extractDisplayName(displayName: string): string {
  if (typeof displayName !== 'string') return 'Unassigned'
  const match = displayName.match(/^(.*?)\s*<.*?>$/)
  return match ? match[1] : displayName
}

// ---------------------------------------------
// 3) GET Handler
// ---------------------------------------------
export async function GET() {
  const tfsBaseUrl =
    process.env.TFS_BASE_URL ||
    'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel'
  const authToken = process.env.TFS_AUTH_TOKEN

  console.log('TFS Base URL:', tfsBaseUrl)
  console.log('TFS Auth Token Present:', authToken ? 'Yes' : 'No')

  if (!authToken) {
    return NextResponse.json({ error: 'TFS_AUTH_TOKEN is not set.' }, { status: 500 })
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`,
  }

  const wiqlUrl = `${tfsBaseUrl}/_apis/wit/wiql?api-version=2.0`
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
  }

  try {
    // Step 1: Execute WIQL query to get work item IDs
    const wiqlResponse = await axios.post(wiqlUrl, query, {
      headers,
      httpsAgent,
    })

    const workItems = wiqlResponse.data.workItems

    if (!workItems || workItems.length === 0) {
      console.log('No work items found.')
      return NextResponse.json([], { status: 200 })
    }

    // ------------------------------------ FETCH DETAILED INFORMATION ABOUT EACH WORK ITEM ------------------------------------
    const workItemDetailsPromises = workItems.map(
      async (item: { id: number; url: string }) => {
        const detailUrl = `${tfsBaseUrl}/_apis/wit/workitems/${item.id}?$expand=All&api-version=1.0`

        try {
          const detailResponse = await axios.get(detailUrl, { headers, httpsAgent })
          const fields = detailResponse.data.fields

          // Construct the final WorkItem object
          const finalItem: WorkItem = {
            id: detailResponse.data.id,
            url: detailResponse.data.url,
            system: {
              Id: fields['System.Id'] ?? 0,
              AreaId: fields['System.AreaId'] ?? 0,
              AreaPath: fields['System.AreaPath'] ?? '',
              TeamProject: fields['System.TeamProject'] ?? '',
              NodeName: fields['System.NodeName'] ?? '',
              AreaLevel1: fields['System.AreaLevel1'] ?? '',
              AreaLevel2: fields['System.AreaLevel2'] ?? '',
              AreaLevel3: fields['System.AreaLevel3'] ?? '',
              AreaLevel4: fields['System.AreaLevel4'] ?? '',
              Rev: fields['System.Rev'] ?? 0,
              AuthorizedDate: fields['System.AuthorizedDate'] ?? '',
              RevisedDate: fields['System.RevisedDate'] ?? '',
              IterationId: fields['System.IterationId'] ?? 0,
              /**
               * "Work Items\\FY25\\FY25_P05\\FY25_P05_Sprint01" => FY25_P05_Sprint01
               * "Work Items\\FY25\\FY25_P05\\FY25_P05_Sprint01". split("\\") === [Work Items, FY25, FY25_P05_Sprint01]
               * [Work Items, FY25, FY25_P05_Sprint01].pop() === FY25_P05_Sprint01 or FY25_PO6_SPRINT02 (Planning)
               * FY25_PO6_SPRINT02 (Planning).replace('(Planning)', '[P]') = FY25_PO6_SPRINT02 [P]
               * */ 
              IterationPath: fields['System.IterationPath'] ? fields['System.IterationPath'].split('\\').pop().replace('(Planning)', '[P]') ?? '' : '',
              IterationLevel1: fields['System.IterationLevel1'] ?? '',
              IterationLevel2: fields['System.IterationLevel2'] ?? '',
              IterationLevel3: fields['System.IterationLevel3'] ?? '',
              IterationLevel4: fields['System.IterationLevel4'] ?? '',
              WorkItemType: fields['System.WorkItemType'] ?? '',
              State: fields['System.State'] ?? '',
              Reason: fields['System.Reason'] ?? '',
              AssignedTo: fields['System.AssignedTo']
                ? extractDisplayName(fields['System.AssignedTo'].displayName)
                : 'Unassigned',
              CreatedDate: fields['System.CreatedDate'] ?? '',
              CreatedBy: fields['System.CreatedBy'] ?? '',
              ChangedDate: fields['System.ChangedDate'] ?? '',
              ChangedBy: fields['System.ChangedBy'] ?? '',
              AuthorizedAs: fields['System.AuthorizedAs'] ?? '',
              PersonId: fields['System.PersonId'] ?? 0,
              Title: fields['System.Title'] ?? '',
              BoardColumn: fields['System.BoardColumn'] ?? '',
              BoardColumnDone: fields['System.BoardColumnDone'] ?? false,
              tags: fields['System.Tags'] ?? '',
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
            // If you’re using WEF fields, parse them here:
            wef: [],
            systemDescription: fields['System.Description'] ?? '',
          }

          return finalItem
        } catch (error: any) {
          // Log or ignore the error for this item
          return null
        }
      }
    )

    const detailedWorkItems = await Promise.all(workItemDetailsPromises)

    // Step 3: Filter out any null results
    const validWorkItems = detailedWorkItems.filter(
      (wi): wi is WorkItem => wi !== null
    )

    return NextResponse.json(validWorkItems, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching work items:', error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    )
  }
}
