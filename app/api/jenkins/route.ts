import { NextResponse } from 'next/server';
import https from 'https';

// Jenkins URL and headers
const jenkinsUrl = 'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/Weekly%20Run';
const headers = {
  // Note: Use an environment variable for sensitive data like authorization tokens
  Authorization: `Basic ${process.env.JENKINS_AUTH_TOKEN}`,
};

// Shared HTTPS Agent to handle SSL issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Be cautious: This disables SSL certificate verification
});

// Helper function to fetch the latest build number for a job
async function getLatestBuildNumber(jobName: string): Promise<number | null> {
  const url = `${jenkinsUrl}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`Failed to fetch latest build number for ${jobName}: ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  return data.number || null;
}

// Helper function to fetch build data
async function fetchBuildData(jobName: string, buildNumber: number) {
  const url = `${jenkinsUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
    //agent: httpsAgent,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data from Jenkins: ${response.statusText}`);
  }

  const data = await response.json();

  // Extracting necessary information
  const causeAction = data.actions.find((action: any) => action._class === 'hudson.model.CauseAction');
  const testResultAction = data.actions.find((action: any) => action._class === 'hudson.tasks.junit.TestResultAction');

  return {
    fullDisplayName: data.fullDisplayName,
    trimmedDisplayName: data.fullDisplayName.split('#')[0].trim(),
    timestamp: data.timestamp,
    number: data.number,
    userName: causeAction?.causes?.find((cause: any) => cause.userName)?.userName || null,
    duration: data.duration,
    estimatedDuration: data.estimatedDuration,
    result: data.result,
    failCount: testResultAction?.failCount || 0,
    totalCount: testResultAction?.totalCount || 0,
    skipCount: testResultAction?.skipCount || 0,
  };
}

// The GET handler for the API route
export async function GET() {
  try {
    const jobList = [
      '00_Shopping_UI_CRT_Agent_Tests',
      '01_Shopping_UI_CRT_Consumer_Part1',
      '02_Shopping_UI_CRT_Consumer_Part2',
      '03_Shopping_UI_CRT_Consumer_Part3',
      '00_Shopping_API_APIConnect_Cruise',
      '00_Shopping_API_Service_Odysseus_Cruise',
      '01_Shopping_API_Service_Derby_Tickets',
    ];

    const results = [];

    for (const jobName of jobList) {
      //console.log(`Processing job: ${jobName}`);
      const buildNumber = await getLatestBuildNumber(jobName);

      if (buildNumber !== null) {
        const buildData = await fetchBuildData(jobName, buildNumber);
        results.push(buildData);
      } else {
        console.error(`No build number found for job: ${jobName}`);
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('Error in API route:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
