// app/api/jenkins/route.ts

import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'

export const runtime = 'nodejs'

// Jenkins base URLs: can override in .env or .env.local
const UI_BASE_URL =
  process.env.JENKINS_BASE_URL_UI ||
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT'

const API_BASE_URL =
  process.env.JENKINS_BASE_URL_API ||
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20Service%20API%20CRT'

const jenkinsAuthToken =
  process.env.JENKINS_AUTH_TOKEN ||
  'cmV0aGkucGlsbGFpQGNvc3Rjb3RyYXZlbC5jb206U2hyaXlhU3JpcmFtJTI2'

const headers = {
  Authorization: `Basic ${jenkinsAuthToken}`,
  'Content-Type': 'application/json',
}

// HTTPS agent (self-signed cert workaround)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// Sample job list
const jobList: string[] = [
  '01_Shopping_UI_CRT_Consumer_Part1', // Shopping Team 1 & 8
  '01_Shopping_API_Service_Derby_Tickets', // Shopping Team 1 & 8
  '02_Shopping_UI_CRT_Consumer_Part2', // Shopping Team 2 & 4
  '00_Shopping_API_Service_Odysseus_Cruise', // Shopping Team 2 & 4
  '03_Shopping_UI_CRT_Consumer_Part3', // Shopping Team 3 & 5
  '03_Shopping_API_Service_Hotel_Search', // Shopping Team 3 & 5
  '00_Shopping_UI_CRT_Agent_Tests', // Shopping Team 6 & 7
  '00_Shopping_API_APIConnect_Cruise', // Shopping Team 6 & 7
  
]

// Interfaces
interface Cause {
  _class: string
  shortDescription?: string
  userName?: string
  userId?: string
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
  commits?: ChangeSet[] // If you want to store them
}

/**
 * Determine which base URL to use for a given job.
 */
function getBaseUrlForJob(jobName: string): string {
  return jobName.includes('_API_') ? API_BASE_URL : UI_BASE_URL
}

/**
 * Extracts the username from hudson.model.CauseAction (if any).
 */
function extractUsername(actions: Action[]): string | null {
  const causeAction = actions.find((action) => action._class === 'hudson.model.CauseAction')
  if (causeAction?.causes) {
    const userCause = causeAction.causes.find((cause) => cause.userName)
    return userCause ? userCause.userName! : null
  }
  return null
}

/**
 * Fetch the latest build number.
 */
async function getLatestBuildNumber(jobName: string): Promise<number> {
  try {
    const baseUrl = getBaseUrlForJob(jobName)
    const response = await axios.get<{ number: number }>(
      `${baseUrl}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`,
      { headers, httpsAgent }
    )

    // If "lastBuild" is empty (e.g., no builds yet), you might get 404 or missing data
    if (typeof response.data.number !== 'number') {
      throw new Error(`Invalid or missing lastBuild number for job: ${jobName}`)
    }

    return response.data.number
  } catch (error: any) {
    console.error(`❌ Error fetching latest build number for job "${jobName}":`, error.message)
    throw error
  }
}

/**
 * Fetch build data for a specific job and build number.
 */
async function fetchBuildData(jobName: string, buildNumber: number): Promise<ProcessedBuildData> {
  try {
    const baseUrl = getBaseUrlForJob(jobName)
    const response = await axios.get<BuildDataRaw>(
      `${baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`,
      { headers, httpsAgent }
    )
    const data = response.data

    // Find relevant actions
    const testResultAction = data.actions.find(
      (action) => action._class === 'hudson.tasks.junit.TestResultAction'
    )
    const parametersAction = data.actions.find(
      (action) => action._class === 'hudson.model.ParametersAction'
    )

    // Extract failed tests from the 'Failed_Tests' parameter
    let failedTests: string[] = []
    if (parametersAction && Array.isArray(parametersAction.parameters)) {
      const failedTestsParam = parametersAction.parameters.find(
        (param) => param.name === 'Failed_Tests'
      )
      if (failedTestsParam && typeof failedTestsParam.value === 'string') {
        failedTests = failedTestsParam.value.split(',').map((test) => test.trim())
      }
    }

    // Optionally parse the changeSet to capture commits
    const commits = data.changeSet?.items || []

    return {
      jobName,
      fullDisplayName: data.fullDisplayName,
      trimmedDisplayName: data.fullDisplayName.split('#')[0].trim(),
      timestamp: data.timestamp,
      number: data.number,
      userName: extractUsername(data.actions),
      duration: data.duration,
      estimatedDuration: data.estimatedDuration,
      result: data.result,
      failCount: testResultAction?.failCount ?? 0,
      totalCount: testResultAction?.totalCount ?? 0,
      skipCount: testResultAction?.skipCount ?? 0,
      failedTests,
      calculatedPassCount: null, // Will be set later
      baselineFound: false,
      commits, // If you want to return commit details
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
 * Find the totalCount from the earliest "baseline" build (userName === null).
 */
async function getBaselineTotalCount(
  jobName: string,
  latestBuildNumber: number
): Promise<number | null> {
  try {
    // If you'd like to limit how far back you go, define e.g.:
    // const MIN_BUILD_NUMBER = Math.max(latestBuildNumber - 50, 1) // last 50 builds
    for (let buildNum = latestBuildNumber; buildNum >= 1; buildNum--) {
      const buildData = await fetchBuildData(jobName, buildNum)
      if (buildData.userName === null) {
        // Found baseline
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
 * Process builds for all jobs in jobList.
 */
async function processAllBuilds(): Promise<ProcessedBuildData[]> {
  const allBuilds: ProcessedBuildData[] = []

  // Process each job in parallel
  await Promise.all(
    jobList.map(async (jobName) => {
      try {
        const latestBuildNumber = await getLatestBuildNumber(jobName)
        const baselineTotalCount = await getBaselineTotalCount(jobName, latestBuildNumber)

        // Iterate from latest build down to #1
        for (let buildNum = latestBuildNumber; buildNum >= 1; buildNum--) {
          const buildData = await fetchBuildData(jobName, buildNum)

          if (buildData.userName === null) {
            // Baseline build
            buildData.calculatedPassCount = buildData.totalCount - buildData.failCount
            buildData.baselineFound = true
            allBuilds.push(buildData)
            break
          } else {
            // Non-baseline build
            if (baselineTotalCount !== null) {
              // Use the baseline total count as the reference for pass/fail
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
 * GET /api/jenkins
 */
export async function GET() {
  try {
    const buildData = await processAllBuilds()
    const response = NextResponse.json(buildData, { status: 200 })
    
    response.headers.set('Cache-Control', 'public, max-age=300, immutable'); // Cache for 5 minutes
    return response
  } catch (error: any) {
    console.error('❌ Error in API route:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
