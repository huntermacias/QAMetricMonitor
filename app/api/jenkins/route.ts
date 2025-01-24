/*
* app/api/jenkins/route.ts
* This file contains the logic for fetching Jenkins build data and processing it into a more usable format.
* Response Example: https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT/job/01_Shopping_UI_CRT_Consumer_Part1/api/json
*/
import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

import { Action, BuildDataRaw, ProcessedBuildData } from "./types";
import { config } from "./config";

const headers = {
  Authorization: `Basic ${config.TOKEN}`,
  "Content-Type": "application/json",
};

// Self-signed cert workaround if needed
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});


/**
 * Decide which base URL (UI vs. API) for a given job name.
 */
function getBaseUrlForJob(jobName: string): string {
  return jobName.includes("_API_") ? config.API_BASE_URL : config.UI_BASE_URL;
}

/**
 * Extract userName from hudson.model.CauseAction.
 */
function extractUsername(actions: Action[]): string | null {
  const causeAction = actions.find((a) => a._class === "hudson.model.CauseAction");
  if (!causeAction?.causes) return null;
  const userCause = causeAction.causes.find((c) => c.userName);
  return userCause ? userCause.userName || null : null;
}

/**
 * Extract cause info (upstream build, shortDescription, etc.).
 */
function extractCauseInfo(actions: Action[]): ProcessedBuildData["cause"] {
  const causeAction = actions.find((a) => a._class === "hudson.model.CauseAction");
  if (!causeAction?.causes || causeAction.causes.length === 0) {
    return {};
  }
  const c = causeAction.causes[0];
  return {
    shortDescription: c.shortDescription,
    upstreamProject: c.upstreamProject,
    upstreamBuild: c.upstreamBuild,
    userName: c.userName ?? null,
  };
}

/**
 * Extract time in queue from jenkins.metrics.impl.TimeInQueueAction.
 */
function extractTimeInQueue(actions: Action[]): ProcessedBuildData["timeInQueue"] {
  const queueAction = actions.find((a) => a._class === "jenkins.metrics.impl.TimeInQueueAction");
  return {
    blockedDurationMillis: queueAction?.blockedDurationMillis ?? 0,
    buildableDurationMillis: queueAction?.buildableDurationMillis ?? 0,
    waitingDurationMillis: queueAction?.waitingDurationMillis ?? 0,
    executingTimeMillis: queueAction?.executingTimeMillis ?? 0,
  };
}

/**
 * Extract JUnit test results from hudson.tasks.junit.TestResultAction.
 */
function extractTestResults(actions: Action[]) {
  const testAction = actions.find((a) => a._class === "hudson.tasks.junit.TestResultAction");
  return {
    failCount: testAction?.failCount ?? 0,
    skipCount: testAction?.skipCount ?? 0,
    totalCount: testAction?.totalCount ?? 0,
  };
}

/**
 * Extract all parameters from hudson.model.ParametersAction.
 */
function extractParameters(actions: Action[]): Record<string, string | boolean | number> {
  const paramAction = actions.find((a) => a._class === "hudson.model.ParametersAction");
  if (!paramAction?.parameters) return {};
  const paramsObject: Record<string, string | boolean | number> = {};
  paramAction.parameters.forEach((p) => {
    paramsObject[p.name] = p.value;
  });
  return paramsObject;
}

/**
 * Extract 'Failed_Tests' from parameters if present.
 */
function extractFailedTests(params: Record<string, string | boolean | number>): string[] {
  const val = params["Failed_Tests"];
  if (!val || typeof val !== "string") return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Fetch the latest build number for a given job.
 */
async function getLatestBuildNumber(jobName: string): Promise<number> {
  const baseUrl = getBaseUrlForJob(jobName);
  const responseURL = `${baseUrl}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`;
  console.log("Fetching latest build number for:", responseURL);
  const resp = await axios.get<{ number: number }>(
    `${baseUrl}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`,
    {
      headers,
      httpsAgent,
    }
  );
  if (typeof resp.data.number !== "number") {
    throw new Error(`No valid 'number' found for job: ${jobName}`);
  }
  return resp.data.number;
}

/**
 * Fetch data for a specific job + build number, returning a ProcessedBuildData object.
 */
async function fetchBuildData(jobName: string, buildNumber: number): Promise<ProcessedBuildData> {
  const baseUrl = getBaseUrlForJob(jobName);
  const resp = await axios.get<BuildDataRaw>(
    `${baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`,
    { headers, httpsAgent }
  );
  const data = resp.data;

  // Ensure result is never null for your BuildData interface
  const result = data.result || "UNKNOWN";

  const { failCount, skipCount, totalCount } = extractTestResults(data.actions);
  const parameters = extractParameters(data.actions);
  const failedTests = extractFailedTests(parameters);
  const cause = extractCauseInfo(data.actions);
  const timeInQueue = extractTimeInQueue(data.actions);

  // Construct our final shape
  const processed: ProcessedBuildData = {
    fullDisplayName: data.fullDisplayName,
    trimmedDisplayName: data.fullDisplayName.split("#")[0].trim(),
    timestamp: data.timestamp,
    number: data.number,
    userName: extractUsername(data.actions),
    duration: data.duration,
    estimatedDuration: data.estimatedDuration,
    result,
    failCount,
    totalCount,
    skipCount,
    failedTests,
    jobName,
    baselineFound: false,
    calculatedPassCount: 0,
    teams: [], // we'll fill or override in UI if needed
    relatedBugs: [], // fill in UI if needed
    commits: data.changeSet?.items || [],
    culprits: data.culprits.map((c) => c.fullName),
    artifacts: data.artifacts,
    parameters,
    cause,
    timeInQueue,
  };

  return processed;
}

/**
 * Find the earliest "baseline" build (userName === null) to get totalCount reference.
 */
async function getBaselineTotalCount(jobName: string, latestBuildNumber: number): Promise<number | null> {
  for (let buildNum = latestBuildNumber; buildNum >= 1; buildNum--) {
    const build = await fetchBuildData(jobName, buildNum);
    if (build.userName === null) {
      return build.totalCount;
    }
  }
  return null;
}

/**
 * Gather build data for each job in jobList, from latest build down to baseline or #1.
 */
async function processAllBuilds(): Promise<ProcessedBuildData[]> {
  const allBuilds: ProcessedBuildData[] = [];

  await Promise.all(
    config.jobList.map(async (jobName) => {
      try {
        const latestBuildNumber = await getLatestBuildNumber(jobName);
        const baselineTotalCount = await getBaselineTotalCount(jobName, latestBuildNumber);

        for (let num = latestBuildNumber; num >= 1; num--) {
          const buildData = await fetchBuildData(jobName, num);

          if (buildData.userName === null) {
            buildData.calculatedPassCount = buildData.totalCount - buildData.failCount;
            buildData.baselineFound = true;
            allBuilds.push(buildData);
            // break; // Uncomment to stop at the first baseline build
          } else {
            // Non-baseline
            if (baselineTotalCount !== null) {
              buildData.calculatedPassCount = baselineTotalCount - buildData.failCount;
              buildData.baselineFound = true;
            }
            allBuilds.push(buildData);
          }
        }
      } catch (err: any) {
        console.error(`❌ Error processing "${jobName}":`, err.message);
      }
    })
  );

  console.log("✅ Completed processing all Jenkins jobs.");
  return allBuilds;
}

/**
 * GET /api/jenkins
 */
export async function GET() {
  try {
    const buildData = await processAllBuilds();
    return NextResponse.json(buildData, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in Jenkins API route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
