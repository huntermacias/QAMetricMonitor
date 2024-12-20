import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export const runtime = 'nodejs';

const jenkinsUrl =
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT';

const headers = {
  Authorization: "Basic cmV0aGkucGlsbGFpQGNvc3Rjb3RyYXZlbC5jb206U2hyaXlhU3JpcmFtJTI2",
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const jobList = [
  '00_Shopping_UI_CRT_Agent_Tests',
  '01_Shopping_UI_CRT_Consumer_Part1',
  '02_Shopping_UI_CRT_Consumer_Part2',
  '03_Shopping_UI_CRT_Consumer_Part3',
  '00_Shopping_API_APIConnect_Cruise',
  '00_Shopping_API_Service_Odysseus_Cruise',
  '01_Shopping_API_Service_Derby_Tickets'
];

// Extract username from CauseAction
function extractUsername(causeAction: any): string | null {
  if (!causeAction || !Array.isArray(causeAction.causes)) return null;
  const cause = causeAction.causes.find((c: any) => c.userName);
  return cause ? cause.userName : null;
}

async function getBuildInfo(jobName: string): Promise<number> {
  try {
    const response = await axios.get(`${jenkinsUrl}/job/${jobName}/lastBuild/api/json`, {
      headers,
      httpsAgent,
    });

    if (!response.data || typeof response.data.number !== 'number') {
      throw new Error(`Invalid response or missing build number for job: ${jobName}`);
    }

    return response.data.number;
  } catch (error: any) {
    console.error(`❌ Error getting build info for job ${jobName}:`, error.message);
    throw error;
  }
}

async function fetchBuildData(jobName: string, buildNumber: number) {
  try {
    const response = await axios.get(`${jenkinsUrl}/job/${jobName}/${buildNumber}/api/json`, {
      headers,
      httpsAgent,
    });

    const data = response.data;

    const causeAction = data.actions.find((action: any) => action._class === 'hudson.model.CauseAction');
    const testResultAction = data.actions.find((action: any) => action._class === 'hudson.tasks.junit.TestResultAction');
    const parametersAction = data.actions.find((action: any) => action._class === 'hudson.model.ParametersAction');

    // Extract failed tests from parameters
    let failedTests: string[] = [];
    if (parametersAction && Array.isArray(parametersAction.parameters)) {
      const failedTestsParam = parametersAction.parameters.find((param: any) => param.name === 'Failed_Tests');
      if (failedTestsParam && typeof failedTestsParam.value === 'string') {
        failedTests = failedTestsParam.value.split(',').map((test: string) => test.trim());
      }
    }


    return {
      jobName,
      fullDisplayName: data.fullDisplayName,
      trimmedDisplayName: data.fullDisplayName.split('#')[0].trim(),
      timestamp: data.timestamp,
      number: data.number,
      userName: causeAction ? extractUsername(causeAction) : null,
      duration: data.duration,
      estimatedDuration: data.estimatedDuration,
      result: data.result,
      failCount: testResultAction ? testResultAction.failCount : 0,
      totalCount: testResultAction ? testResultAction.totalCount : 0,
      skipCount: testResultAction ? testResultAction.skipCount : 0,
      failedTests,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching build data for job ${jobName}, build #${buildNumber}:`, error.message);
    throw error;
  }
}

/**
 * Finds the first build in this job with userName === null, returning its totalCount or null.
 * This is used as a baseline to calculate passing tests for subsequent builds.
 */
async function getTotalCountForNullUser(jobName: string) {
  try {
    const buildInfo = await getBuildInfo(jobName);

    for (let j = buildInfo; j > 0; j--) {
      const buildData = await fetchBuildData(jobName, j);
      if (buildData.userName === null) {
        return buildData.totalCount;
      }
    }

    return null;
  } catch (error: any) {
    console.error(`❌ Error getting totalCount for null user in job ${jobName}:`, error.message);
    return null;
  }
}

/**
 * Get baseline total counts for all known jobs by finding null-user builds.
 */
async function getTotalCountsForNullUser() {
  const totalCounts: Record<string, number | null> = {};
  for (const jobName of jobList) {
    totalCounts[jobName] = await getTotalCountForNullUser(jobName);
  }
  return totalCounts;
}

/**
 * Processes builds:
 *  - Retrieves baseline total counts from null-user builds for each job.
 *  - For each job, iterates from the latest build down:
 *    - On encountering a null-user (timer-triggered) build, sets the baseline and stops.
 *    - For other builds, calculates passCount based on the baseline totalCount.
 * Returns a rich array of processed build data.
 */
async function processBuildsforTrendData() {
  const nullUserTotalCounts = await getTotalCountsForNullUser();
  const allBuilds: any[] = [];
  let allBuildsProcessed = true;

  for (const jobName of jobList) {
    console.log(`🔄 Processing job: ${jobName}`);
    try {
      const buildInfo = await getBuildInfo(jobName);
      const nullUserTotalCount = nullUserTotalCounts[jobName];
      let buildProcessed = false;

      for (let j = buildInfo; j > 0; j--) {
        const buildData = await fetchBuildData(jobName, j);

        if (buildData.userName === null) {
          console.log(`⚙️ Baseline (null-user) build found for job ${jobName}. Stopping further processing.`);
          const passCount = buildData.totalCount - buildData.failCount;
          allBuilds.push({
            ...buildData,
            calculatedPassCount: passCount,
            baselineFound: true,
          });
          buildProcessed = true;
          break; 
        } else {
          if (nullUserTotalCount !== null) {
            const passCount = nullUserTotalCount - buildData.failCount;
            allBuilds.push({
              ...buildData,
              calculatedPassCount: passCount,
              baselineFound: true,
            });
          } else {
            // No baseline found yet, record build data with no calculated pass count
            allBuilds.push({
              ...buildData,
              calculatedPassCount: null,
              baselineFound: false,
            });
          }

          buildProcessed = true;
          console.log(`✅ Processed build: ${buildData.fullDisplayName}`);
        }
      }

      if (!buildProcessed) {
        console.warn(`⚠️ No builds processed for job ${jobName}. Check if the job has any builds.`);
        allBuildsProcessed = false;
      }
    } catch (error: any) {
      console.error(`❌ Error processing job ${jobName}:`, error.message);
      allBuildsProcessed = false;
    }
  }

  if (allBuildsProcessed) {
    console.log('🎉 All builds processed successfully.');
  } else {
    console.log('❗ Some builds were not processed. Please review the logs for details.');
  }

  return allBuilds;
}

export async function GET() {
  try {
    const result = await processBuildsforTrendData();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error in API route:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
