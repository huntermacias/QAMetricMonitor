// app/api/buildStatus/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export const runtime = 'nodejs';

const JENKINS_DEPLOY_JOBS = process.env.NEXT_PUBLIC_JENKINS_DEPLOY_JOBS;
const jenkinsAuthToken = process.env.NEXT_PUBLIC_JENKINS_AUTH_TOKEN;


const headers = {
  Authorization: `Basic ${jenkinsAuthToken}`,
  'Content-Type': 'application/json',
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// List of jobs to process
const jobList: string[] = [
  "Deploy - Dev",
  "Deploy - DevProd",
  "Deploy - QA",
  "Deploy - Perf",
  "Deploy - QA2", 
  "Deploy - QAAuto", 
  "Deploy - QAPROD", 
  
];

// Interfaces
interface JenkinsJob {
  name: string;
  url: string;
  color: string;
}

interface JenkinsResponse {
  description: string | null;
  jobs: JenkinsJob[];
}

/**
 * Fetch job details from Jenkins.
 * @returns {Promise<JenkinsResponse>} The list of Jenkins jobs with their statuses.
 */
async function fetchJobs(): Promise<JenkinsResponse> {
  try {
    const response = await axios.get(`${JENKINS_DEPLOY_JOBS}/api/json`, {
      headers,
      httpsAgent,
    });
    return response.data as JenkinsResponse;
  } catch (error: any) {
    console.error('❌ Error fetching jobs from Jenkins:', error.message);
    throw new Error('Failed to fetch Jenkins jobs.');
  }
}

/**
 * Process builds for all jobs in the job list.
 * Logs success or failure for each job.
 */
async function processAllJobs(): Promise<void> {
  await Promise.all(
    jobList.map(async (jobName) => {
      try {
        const jobUrl = `${JENKINS_DEPLOY_JOBS}/job/${encodeURIComponent(jobName)}/api/json`;
        console.log('job', jobUrl); 
        const response = await axios.get(jobUrl, { headers, httpsAgent });
        console.log(`✅ Successfully processed job "${jobName}":`, response.data);
      } catch (error: any) {
        console.error(`❌ Error processing job "${jobName}":`, error.message);
      }
    })
  );

  console.log('🎉 All builds processed successfully.');
}

/**
 * GET /api/jenkins
 * Returns job statuses from Jenkins.
 */
export async function GET() {
  try {
    // Fetch job statuses
    const jobData = await fetchJobs();

    // Optionally process all jobs (if additional logic is needed)
    await processAllJobs();




    // Return job data in the response
    return NextResponse.json({ message: 'success', data: jobData.jobs }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error in API route:', error.message);
    return NextResponse.json({ message: 'error', error: error.message }, { status: 500 });
  }
}
