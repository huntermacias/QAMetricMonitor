// app/api/ranking/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Define Contributor Type with Proper Typing
type Contributor = {
  name: string;
  totalPRs: number;
  avgTimeToMerge: number; // in milliseconds
  positiveVotes: number;
  neutralVotes: number;
  negativeVotes: number;
  uniqueBranches: number;
  autoCompletedPRs: number;
  fastMerges: number;
  commitsByDate: Record<string, number>;
};

// Define Environment Types
type Environment = 'QA' | 'DEV';

// Define Repo Environment Mapping
const repoEnvironments: Record<string, Environment> = {
  uiautoTests: 'QA',
  ctUtils: 'QA',
  derbyV2: 'QA',
  derbyHotelApiTest: 'QA',
  ctWebDriver: 'QA',
  apiconnect: 'QA',
  zurichEgresMSTests: 'QA',
  egress1: 'QA',
  core: 'DEV',
  consumer: 'DEV',
};

// API Route Handler
export async function GET() {
  const tfsBaseUrls: Record<Environment, string> = {
    QA: 'https://tfs.pacific.costcotravel.com/tfs/TestAutomation', // QA/SDET
    DEV: 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel', // DEV
  };
  const authToken =
    process.env.TFS_AUTH_TOKEN ||
    'cmV0aGkucGlsbGFpQGNvc3Rjb3RyYXZlbC5jb206dnJsdXJiYnZza3RhZWdtdnlhang1eHU3ZjZuc29sY3R2dWs2bXc1dmd4eTQ3dXpya3J5cQ==';

  // TODO: Replace with dynamic API call to fetch all creatorIDs from portfolios
  const creatorIds: Record<string, string> = {
    tim: '931f58f3-c186-4e2c-93e2-965a896c733c',
    hunter: '3e9bcd43-8a35-491c-81df-290cc9a3aec2',
    vlad: '1968d5a5-96a6-4d9e-86e5-4d452b2a3d51',
    peter: '5bf1f353-0c2e-43ce-9e54-6c26a3f7f0d1',
    sujan: '388bfebf-53b9-4e4e-8692-648f48e523f9',
    shilpa: 'f4f08e2a-1adc-4231-b414-5d4254bc1582',
    ajay: '527f5cad-b2cb-4822-965c-b31a3fdb555c',
    smitha: '7726cc4b-4709-4b55-b444-0467b5a6a3c6',
    anbu: '2abf29df-56a4-450b-98db-a2e1818268a0',
    izanna: 'c3644ab3-a22f-4640-8766-0483eaddb4a9',
    rethi: '38c4a263-831e-4d6f-8ae9-b62a8344fa85',
    viktor: '807786fb-4816-4400-958d-03b640f09aa9',
    cole: 'a1ee0466-9eff-48f4-b5bb-df9933f34629',
    mohammad: '26fb170c-b8db-4da2-b9ee-785838aec45f', // DEV
    chetak: 'ba0d1a48-3445-4b30-949b-1a3848e54969', // DEV
    karthik: '0bef6d4c-8068-4be1-abed-ed7085d16074', // DEV
    alan: 'e0d928f0-69b1-4320-b1bb-33442f7ae63d'
  };

  // TODO: Replace with dynamic API call to fetch all repos
  const repoIds: Record<string, string> = {
    uiautoTests: 'fa36faa9-5026-46b8-84eb-561117e8f4fe',
    ctUtils: '2b0c057d-b030-4fd8-87e6-f6961c50bc68',
    derbyV2: '8d4f1a0d-093f-4d1c-b08c-5ed4aebb4518',
    derbyHotelApiTest: 'd4a9243c-cbfc-4f9a-b441-028a13218089',
    ctWebDriver: '43b72988-0062-46d8-846f-0b9ab7f08789',
    apiconnect: 'c05c7ef9-5fe8-4db5-8ab1-c9fcb4595dac',
    zurichEgresMSTests: '3a6a8a58-666a-4f5c-8134-1fc26c494ca6',
    egress1: '5e15c513-64d8-4889-a890-188371c8f6ae',
    hotelSearchIngress: '77d8b832-5366-45af-a84d-0d9a3cd5cfb8', 
    odysseusCruiseDataGenerator: '7faf8b49-851c-425d-b796-ff7acbdebce4',
    qaPerf: '24f737fe-451a-4aa0-90fc-fc3427f6fa39',
    routehappyServiceTest: '19d14987-34f8-444f-aaa0-49ed55e3e7cc',
    core: '695208e1-46b6-415a-974c-b26e067c8ab4', // DEV
    consumer: 'e4ac12a4-c640-4637-9843-83b66e2f5e7c', // DEV
  };

  const headers = {
    Authorization: `Basic ${authToken}`,
    'Content-Type': 'application/json',
  };

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  // Function to fetch pull requests based on repo, creator, and environment
  const fetchPullRequestsByRepoAndCreator = async (
    baseUrl: string,
    repoId: string,
    creatorId: string
  ) => {
    const pullRequestsUrl = `${baseUrl}/_apis/git/repositories/${repoId}/pullrequests?creatorId=${creatorId}&status=completed&api-version=4.1`;

    try {
      const response = await axios.get(pullRequestsUrl, {
        headers,
        httpsAgent,
      });
      return response.data.value || [];
    } catch (error: any) {
      console.error(
        `Error fetching pull requests for repoId ${repoId}, creatorId ${creatorId}, baseUrl ${baseUrl}:`,
        error.message
      );
      return [];
    }
  };

  try {
    const currentYear = new Date().getFullYear();
    const metrics: Record<string, Contributor> = {};

    for (const [repoName, repoId] of Object.entries(repoIds)) {
      const environment = repoEnvironments[repoName];
      if (!environment) {
        console.warn(`Environment not defined for repo: ${repoName}`);
        continue;
      }

      const baseUrl = tfsBaseUrls[environment];
      if (!baseUrl) {
        console.warn(`Base URL not defined for environment: ${environment}`);
        continue;
      }

      for (const [name, creatorId] of Object.entries(creatorIds)) {
        const pullRequests = await fetchPullRequestsByRepoAndCreator(
          baseUrl,
          repoId,
          creatorId
        );

        const filteredPullRequests = pullRequests.filter((pr: any) => {
          const closedDate = new Date(pr.closedDate);
          return closedDate.getFullYear() === currentYear;
        });

        if (!metrics[name]) {
          metrics[name] = {
            name,
            totalPRs: 0,
            avgTimeToMerge: 0,
            positiveVotes: 0,
            neutralVotes: 0,
            negativeVotes: 0,
            uniqueBranches: 0,
            autoCompletedPRs: 0,
            fastMerges: 0,
            commitsByDate: {},
          };
        }

        const timeToMerge = filteredPullRequests.map((pr: any) => {
          const creation = new Date(pr.creationDate).getTime();
          const closed = new Date(pr.closedDate).getTime();
          return closed - creation;
        });

        const avgTimeToMerge =
          timeToMerge.length > 0
            ? timeToMerge.reduce((sum: number, time: number) => sum + time, 0) /
              timeToMerge.length
            : 0;

        const reviewerStats = filteredPullRequests.flatMap(
          (pr: any) => pr.reviewers || []
        );
        const positiveVotes = reviewerStats.filter(
          (r: any) => r.vote === 10
        ).length;
        const neutralVotes = reviewerStats.filter(
          (r: any) => r.vote === 0
        ).length;
        const negativeVotes = reviewerStats.filter(
          (r: any) => r.vote === -10
        ).length;

        const uniqueBranches = new Set(
          filteredPullRequests.map((pr: any) => pr.sourceRefName)
        ).size;

        const autoCompletedPRs = filteredPullRequests.filter(
          (pr: any) =>
            pr.completionOptions?.triggeredByAutoComplete
        ).length;

        // Aggregate commits by date
        filteredPullRequests.forEach((pr: any) => {
          const commitDate = new Date(pr.closedDate)
            .toISOString()
            .split('T')[0];
          metrics[name].commitsByDate[commitDate] =
            (metrics[name].commitsByDate[commitDate] || 0) + 1;
        });

        // Update metrics
        metrics[name].totalPRs += filteredPullRequests.length;
        // Calculate new average time to merge
        metrics[name].avgTimeToMerge =
          (metrics[name].avgTimeToMerge * (metrics[name].totalPRs - filteredPullRequests.length) +
            avgTimeToMerge) /
          metrics[name].totalPRs;
        metrics[name].positiveVotes += positiveVotes;
        metrics[name].neutralVotes += neutralVotes;
        metrics[name].negativeVotes += negativeVotes;
        metrics[name].uniqueBranches += uniqueBranches;
        metrics[name].autoCompletedPRs += autoCompletedPRs;
        metrics[name].fastMerges += filteredPullRequests.filter(
          (pr: any) =>
            avgTimeToMerge > 0 &&
            avgTimeToMerge < 2 * 60 * 60 * 1000 // Fast merge = under 2 hours
        ).length;
      }
    }

    return NextResponse.json(metrics, { status: 200 });
  } catch (error: any) {
    console.error('Error processing pull requests:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}
