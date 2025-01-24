import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import https from 'node:https'


export const runtime = 'nodejs'

const httpsAgent = new https.Agent( { rejectUnauthorized: false })
const username = process.env.JENKINS_USERNAME
const token = process.env.JENKINS_TRIGGER_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { jobName, parameters } = await request.json()

    if (!jobName) {
      return NextResponse.json({ error: 'Missing jobName.' }, { status: 400 })
    }

    const jenkinsUrl = `https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT/job/${encodeURIComponent(jobName)}/buildWithParameters`

    if (!username || !token) {
      return NextResponse.json(
        { error: 'JENKINS_USERNAME or JENKINS_TRIGGER_TOKEN not set in env.' },
        { status: 500 }
      )
    }
  
    const auth = { username, password: token }

    const response = await axios.post(jenkinsUrl, {}, {
      auth,
      httpsAgent,
    })

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
