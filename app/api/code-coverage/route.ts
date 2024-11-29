// app/api/code-coverage/route.ts

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
    // Get the latest successful build
    const buildsUrl = `${tfsBaseUrl}/${projectName}/_apis/build/builds?api-version=5.1&$top=1&resultFilter=succeeded`;
    const buildsResponse = await axios.get(buildsUrl, { headers, httpsAgent });
    const builds = buildsResponse.data.value;

    if (!builds || builds.length === 0) {
      return NextResponse.json({ message: 'No successful builds found.' }, { status: 200 });
    }

    const buildId = builds[0].id;

    // Get code coverage data for the build
    const coverageUrl = `${tfsBaseUrl}/${projectName}/_apis/test/codecoverage?api-version=5.1&buildId=${buildId}`;
    const coverageResponse = await axios.get(coverageUrl, { headers, httpsAgent });
    const coverageData = coverageResponse.data;

    if (!coverageData || coverageData.count === 0) {
      return NextResponse.json({ message: 'No code coverage data found.' }, { status: 200 });
    }

    // Process coverage data
    const coverageStats = coverageData.value[0].coverageData[0].coverageStats;

    const totalBlocks = coverageStats.reduce((sum: number, stat: any) => sum + stat.total, 0);
    const coveredBlocks = coverageStats.reduce((sum: number, stat: any) => sum + stat.covered, 0);

    const codeCoveragePercentage = (coveredBlocks / totalBlocks) * 100;

    return NextResponse.json({ codeCoveragePercentage }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching code coverage:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
