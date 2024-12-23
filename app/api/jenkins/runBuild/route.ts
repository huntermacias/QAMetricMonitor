import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import https from 'node:https'

/**
 * Force Next.js to run on Node.js runtime (not Edge),
 * so we can use `node:https`, `axios`, custom TLS, etc.
 */
export const runtime = 'nodejs'

/**
 * Create an HTTPS Agent that ignores invalid or self-signed certificates.
 * For production usage, you’d ideally add the correct CA to trust store 
 * instead of ignoring the cert.
 */
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export async function POST(request: NextRequest) {
  try {
    const { jobName, parameters } = await request.json()

    if (!jobName) {
      return NextResponse.json({ error: 'Missing jobName.' }, { status: 400 })
    }

    // Example Jenkins URL
    const jenkinsUrl = `https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT/job/${encodeURIComponent(jobName)}/buildWithParameters`

    // Pull Jenkins credentials from environment variables
    const username = process.env.JENKINS_USERNAME
    const token = process.env.JENKINS_TRIGGER_TOKEN

    if (!username || !token) {
      return NextResponse.json(
        { error: 'JENKINS_USERNAME or JENKINS_TRIGGER_TOKEN not set in env.' },
        { status: 500 }
      )
    }

    // Build basic auth string
    const auth = {
      username,
      password: token,
    }

    // If you have build parameters, you can send them in Axios either as params or data:
    // For Jenkins, buildWithParameters typically expects either query params or form data.
    // Here’s how you might do query params:
    // const response = await axios.post(jenkinsUrl, null, {
    //   params: parameters,
    //   auth,
    //   httpsAgent,
    // })

    // Or if you have no parameters, just do a basic POST:
    const response = await axios.post(jenkinsUrl, {}, {
      auth,
      httpsAgent,
    })

    // Jenkins usually returns 201 Created or 200 OK when triggered successfully
    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        { error: `Failed to trigger Jenkins build: ${response.statusText}` },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: `Build triggered successfully for job "${jobName}".`,
    })
  } catch (error: any) {
    console.error('Error triggering build:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
