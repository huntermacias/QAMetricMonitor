// app/api/jenkins/route.ts

import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'

// Define the runtime environment
export const runtime = 'nodejs'

// If you want to override these in .env, you can do so:
const UI_BASE_URL =
  process.env.JENKINS_BASE_URL_UI ||
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT'

const API_BASE_URL =
  process.env.JENKINS_BASE_URL_API ||
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20Service%20API%20CRT'

/**
 * Jenkins auth token in Base64: "Basic <token>"
 * or just the part after 'Basic ', depending on how you store it.
 */
const jenkinsAuthToken =
  process.env.JENKINS_AUTH_TOKEN ||
  'cmV0aGkucGlsbGFpQGNvc3Rjb3RyYXZlbC5jb206U2hyaXlhU3JpcmFtJTI2'

// Configure axios headers using environment variables
const headers = {
  Authorization: `Basic ${jenkinsAuthToken}`,
  'Content-Type': 'application/json',
}

// Configure HTTPS Agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Set to true in production with valid SSL certificates
})

// List of Jenkins jobs to process (both UI and API)
const jobList: string[] = [
  '00_Shopping_UI_CRT_Agent_Tests',
  '01_Shopping_UI_CRT_Consumer_Part1',
  '02_Shopping_UI_CRT_Consumer_Part2',
  '03_Shopping_UI_CRT_Consumer_Part3',
  '00_Shopping_API_APIConnect_Cruise',
  '00_Shopping_API_Service_Odysseus_Cruise',
  '01_Shopping_API_Service_Derby_Tickets',
]

// TypeScript interfaces for Jenkins API responses
interface Cause {
  _class: string
  userName?: string
}

interface Action {
  _class: string
  causes?: Cause[]
  parameters?: Array<{ name: string; value: string | boolean }>
  failCount?: number
  skipCount?: number
  totalCount?: number
}

interface ChangeSetPath {
  editType: string
  file: string
}

interface ChangeSet {
  _class: string
  affectedPaths: ChangeSetPath[]
  commitId: string
  timestamp: number
  authorEmail: string
  comment: string
  date: string
  id: string
  msg: string
  paths: ChangeSetPath[]
}

interface ChangeSetList {
  _class: string
  items: ChangeSet[]
  kind: string
}

interface BuildDataRaw {
  _class: string
  actions: Action[]
  artifacts: Array<{ displayPath: string; fileName: string; relativePath: string }>
  building: boolean
  description: string | null
  displayName: string
  duration: number
  estimatedDuration: number
  executor: string | null
  fullDisplayName: string
  id: string
  inProgress: boolean
  keepLog: boolean
  number: number
  queueId: number
  result: string | null
  timestamp: number
  url: string
  builtOn: string
  changeSet: ChangeSetList
}

interface ProcessedBuildData {
  jobName: string
  fullDisplayName: string
  trimmedDisplayName: string
  timestamp: number
  number: number
  userName: string | null
  duration: number
  estimatedDuration: number
  result: string | null
  failCount: number
  totalCount: number
  skipCount: number
  failedTests: string[]
  calculatedPassCount: number | null
  baselineFound: boolean
}

/**
 * Determine which base URL to use for a given job.
 * Here we just check if the job name contains "_API_".
 * Adjust logic as needed.
 */
function getBaseUrlForJob(jobName: string): string {
  if (jobName.includes('_API_')) {
    return API_BASE_URL
  } else {
    return UI_BASE_URL
  }
}

/**
 * Extracts the username from the CauseAction.
 * (Currently not used, but here for reference)
 */
function extractUsername(actions: Action[]): string | null {
  const causeAction = actions.find((action) => action._class === 'hudson.model.CauseAction')
  if (causeAction && causeAction.causes) {
    const userCause = causeAction.causes.find((cause) => cause.userName)
    return userCause ? userCause.userName! : null
  }
  return null
}

/**
 * Fetches the latest build number for a given job.
 */
async function getLatestBuildNumber(jobName: string): Promise<number> {
  try {
    const baseUrl = getBaseUrlForJob(jobName)
    const response = await axios.get<{ number: number }>(
      `${baseUrl}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`,
      { headers, httpsAgent }
    )

    if (typeof response.data.number !== 'number') {
      throw new Error(`Invalid build number for job: ${jobName}`)
    }

    return response.data.number
  } catch (error: any) {
    console.error(`❌ Error fetching latest build number for job "${jobName}":`, error.message)
    throw error
  }
}

/**
 * Fetches detailed build data for a specific job and build number.
 */
async function fetchBuildData(jobName: string, buildNumber: number): Promise<ProcessedBuildData> {
  try {
    const baseUrl = getBaseUrlForJob(jobName)
    const response = await axios.get<BuildDataRaw>(
      `${baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`,
      { headers, httpsAgent }
    )

    const data = response.data
    const causeAction = data.actions.find((action) => action._class === 'hudson.model.CauseAction')
    const testResultAction = data.actions.find(
      (action) => action._class === 'hudson.tasks.junit.TestResultAction'
    )
    const parametersAction = data.actions.find(
      (action) => action._class === 'hudson.model.ParametersAction'
    )

    // Extract failed tests from parameters
    let failedTests: string[] = []
    if (parametersAction && Array.isArray(parametersAction.parameters)) {
      const failedTestsParam = parametersAction.parameters.find(
        (param) => param.name === 'Failed_Tests'
      )
      if (failedTestsParam && typeof failedTestsParam.value === 'string') {
        failedTests = failedTestsParam.value.split(',').map((test) => test.trim())
      }
    }

    return {
      jobName,
      fullDisplayName: data.fullDisplayName,
      trimmedDisplayName: data.fullDisplayName.split('#')[0].trim(),
      timestamp: data.timestamp,
      number: data.number,
      userName:  extractUsername(data.actions), // Or use extractUsername(data.actions) if you want the actual user
      duration: data.duration,
      estimatedDuration: data.estimatedDuration,
      result: data.result,
      failCount: testResultAction?.failCount ?? 0,
      totalCount: testResultAction?.totalCount ?? 0,
      skipCount: testResultAction?.skipCount ?? 0,
      failedTests,
      calculatedPassCount: null, // To be calculated later
      baselineFound: false, // To be determined later
    }
  } catch (error: any) {
    console.error(
      `❌ Error fetching build data for job "${jobName}", build #${buildNumber}:`,
      error.message
    )
    throw error
  }
}

/**
 * Finds the first build with userName === null to establish a baseline totalCount.
 */
async function getBaselineTotalCount(
  jobName: string,
  latestBuildNumber: number
): Promise<number | null> {
  try {
    for (let buildNum = latestBuildNumber; buildNum >= 1; buildNum--) {
      const buildData = await fetchBuildData(jobName, buildNum)
      if (buildData.userName === null) {
        return buildData.totalCount
      }
    }
    return null
  } catch (error: any) {
    console.error(`❌ Error finding baseline for job "${jobName}":`, error.message)
    return null
  }
}

/**
 * Processes all builds for trend data.
 */
async function processAllBuilds(): Promise<ProcessedBuildData[]> {
  const allBuilds: ProcessedBuildData[] = []

  // Process jobs in parallel
  await Promise.all(
    jobList.map(async (jobName) => {
      try {
        const latestBuildNumber = await getLatestBuildNumber(jobName)
        const baselineTotalCount = await getBaselineTotalCount(jobName, latestBuildNumber)

        // Iterate from latest build down to 1
        for (let buildNum = latestBuildNumber; buildNum >= 1; buildNum--) {
          const buildData = await fetchBuildData(jobName, buildNum)

          if (buildData.userName === null) {
            // This is the baseline build
            buildData.calculatedPassCount = buildData.totalCount - buildData.failCount
            buildData.baselineFound = true
            allBuilds.push(buildData)
            break // Stop once we find a baseline
          } else {
            // Non-baseline build
            if (baselineTotalCount !== null) {
              buildData.calculatedPassCount = baselineTotalCount - buildData.failCount
              buildData.baselineFound = true
            } else {
              buildData.calculatedPassCount = null
              buildData.baselineFound = false
            }
            allBuilds.push(buildData)
          }
        }

        console.log(`✅ Successfully processed job "${jobName}".`)
      } catch (error: any) {
        console.error(`❌ Error processing job "${jobName}":`, error.message)
      }
    })
  )

  console.log('🎉 All builds processed successfully.')
  return allBuilds
}

/**
 * API Route Handler: GET /api/jenkins
 */
export async function GET() {
  try {
    const buildData = await processAllBuilds()
    return NextResponse.json(buildData, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error in API route:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
