// app/api/teams/getMembers/route.ts
// docs: https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get-team-members-with-extended-properties?view=vsts-rest-tfs-4.1&tabs=HTTP

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https'

interface TeamMember {
  isTeamAdmin?: boolean; 
  identity: {
    displayName: string;
    url: string; 
    id: string; 
    uniqueName: string; 
    imageUrl: string; 
  }
}

interface TeamMembersResponse {
  value: TeamMember[]; 
}

export async function GET() {
    const TFS_BASE = process.env.TFS_BASE;
    const authToken = process.env.TFS_AUTH_TOKEN
  
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
  
  try {
    // Example: Fetch data from an external API or perform server-side operations
    const response = await axios.get<TeamMembersResponse>(`${TFS_BASE}/tfs/TestAutomation/_apis/projects/baac0adf-5cc1-40ae-a92f-c9adc45fd198/teams/5191c4ff-b34e-414d-9ef5-ee26cc01ffe2/members?api-version=4.1`,
      { headers, httpsAgent }
    );
  

    // Return a JSON response
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch data.' },
      { status: 500 }
    );
  }
}
