// app/api/jenkins/trigger/[jobName]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export const runtime = 'nodejs';

// Environment Variables for Security
const jenkinsBaseUrl =
  process.env.JENKINS_BASE_URL ||
  'https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT';
const jenkinsAuthToken =
  process.env.JENKINS_AUTH_TOKEN ||
  'cmV0aGkucGlsbGFpQGNvc3Rjb3RyYXZlbC5jb206U2hyaXlhU3JpcmFtJTI2'; // Replace with secure method
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Handler to Trigger Jenkins Build
export async function POST(req: NextRequest, { params }: { params: { jobName: string } }) {
  const { jobName } = params;

  if (!jobName) {
    return NextResponse.json(
      { error: 'Job name is required to trigger a build.' },
      { status: 400 }
    );
  }

  // Optional: Extract parameters from the request body if the job requires parameters
  let buildUrl = `${jenkinsBaseUrl}/job/${encodeURIComponent(jobName)}/build`;

  try {
    // Check if the job requires parameters
    const jobInfoResponse = await axios.get(`${jenkinsBaseUrl}/job/${encodeURIComponent(jobName)}/api/json`, {
      headers: {
        Authorization: `Basic ${jenkinsAuthToken}`,
      },
      httpsAgent,
    });

    const jobInfo = jobInfoResponse.data;

    if (jobInfo.parameterDefinitions && jobInfo.parameterDefinitions.length > 0) {
      // If parameters are required, use buildWithParameters endpoint
      buildUrl = `${jenkinsBaseUrl}/job/${encodeURIComponent(jobName)}/buildWithParameters`;

      // Extract parameters from the request body
      const { parameters } = await req.json();

      if (!parameters || typeof parameters !== 'object') {
        return NextResponse.json(
          { error: 'Parameters are required for this job.' },
          { status: 400 }
        );
      }

      // Construct query string with parameters
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(parameters)) {
        queryParams.append(key, String(value));
      }

      buildUrl += `?${queryParams.toString()}`;
    }

    // Trigger the build
    const triggerResponse = await axios.post(buildUrl, null, {
      headers: {
        Authorization: `Basic ${jenkinsAuthToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });

    // Jenkins typically returns 201 for successful build trigger
    if (triggerResponse.status === 201) {
      return NextResponse.json(
        { message: `Build for job "${jobName}" has been triggered successfully.` },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: `Unexpected response status: ${triggerResponse.status}` },
        { status: triggerResponse.status }
      );
    }
  } catch (error: any) {
    console.error(`❌ Error triggering build for job "${jobName}":`, error.message);

    // Handle specific error scenarios
    if (error.response) {
      return NextResponse.json(
        { error: error.response.data || error.message },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: 'An unknown error occurred while triggering the build.' },
        { status: 500 }
      );
    }
  }
}