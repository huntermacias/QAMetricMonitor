// app/api/test-case-status/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET() {
  const tfsBaseUrl = process.env.TFS_BASE_URL;
  const authToken = process.env.TFS_AUTH_TOKEN;
  const projectName = process.env.TFS_PROJECT_NAME; // Set your project name in environment variables

  if (!authToken || !projectName) {
    return NextResponse.json(
      { error: 'TFS_AUTH_TOKEN or TFS_PROJECT_NAME is not set.' },
      { status: 500 }
    );
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${authToken}`,
  };

  try {
    // Get all test runs
    const testRunsUrl = `${tfsBaseUrl}/${projectName}/_apis/test/runs?api-version=5.1`;
    const testRunsResponse = await axios.get(testRunsUrl, { headers, httpsAgent });
    const testRuns = testRunsResponse.data.value;

    if (!testRuns || testRuns.length === 0) {
      return NextResponse.json({ message: 'No test runs found.' }, { status: 200 });
    }

    const testCaseStatus: Record<string, number> = {};

    // Fetch test results for each run
    for (const run of testRuns) {
      const runId = run.id;
      const testResultsUrl = `${tfsBaseUrl}/${projectName}/_apis/test/Runs/${runId}/results?api-version=5.1`;
      const testResultsResponse = await axios.get(testResultsUrl, { headers, httpsAgent });
      const testResults = testResultsResponse.data.value;

      testResults.forEach((result: any) => {
        const outcome = result.outcome;
        testCaseStatus[outcome] = (testCaseStatus[outcome] || 0) + 1;
      });
    }

    return NextResponse.json(testCaseStatus, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching test case status:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
