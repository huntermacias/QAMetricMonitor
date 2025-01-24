/**
 * file route: app/api/ranking/route.ts
 * api endpoint structure: https://${instance}/tfs/${collection}/_apis/teams?api-version=4.1-preview.2
 * live endpoint example: https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/teams?api-version=4.1-preview.2
 * example response: 
 * {
 *    value: [
 *        {
            "id": "5191c4ff-b34e-414d-9ef5-ee26cc01ffe2",
            "name": "Shopping portfolio",
            "url": "https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/projects/baac0adf-5cc1-40ae-a92f-c9adc45fd198/teams/5191c4ff-b34e-414d-9ef5-ee26cc01ffe2",
            "description": "",
            "identityUrl": "https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/Identities/5191c4ff-b34e-414d-9ef5-ee26cc01ffe2",
            "projectName": "Git_repo",
            "projectId": "baac0adf-5cc1-40ae-a92f-c9adc45fd198"
          },
 *    ]
 * }
 * 
 * 
 * baac0adf-5cc1-40ae-a92f-c9adc45fd198
 * https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/projects/e8919900-3758-4a80-9a38-4391f5210aca/properties?api-version=4.1-preview.2
 * GET ALL PROJECTS:
 * live endpoint example: https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/projects?api-version=4.1-preview.2
 * example response: 
 * {
 *    count: number, 
 *    value: [
 *      {
          "id": "e8919900-3758-4a80-9a38-4391f5210aca",
          "name": "Work Items",
          "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/projects/e8919900-3758-4a80-9a38-4391f5210aca",
          "state": "wellFormed",
          "revision": 5689263,
          "visibility": "private"
        },
 *   ]
 * }
 * 
 */

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

// Utility function to get the last 12 months as an array of { year, month }
function getLast12Months(): { year: number; month: number }[] {
  const months = [];
  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({ year: date.getFullYear(), month: date.getMonth() + 1 }); // month is 1-based
  }

  return months;
}

// In-Memory Cache for creatorIds
let cache: Record<string, string> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Type Definitions for Teams and Members
type Team = {
  id: string;
  name: string;
  url: string;
  description: string;
  identityUrl: string;
  projectName: string;
  projectId: string;
};

type TeamMember = {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
  isTeamAdmin?: boolean;
};

// Function to Fetch All Teams from TFS
const fetchAllTeams = async (): Promise<Team[]> => {
  const instance = 'tfs.pacific.costcotravel.com';
  const collection = 'TestAutomation';
  const pat = process.env.TFS_AUTH_TOKEN;
  if (!instance || !collection || !pat) {
    throw new Error('Missing TFS_INSTANCE, TFS_COLLECTION, or TFS_PAT in environment variables.');
  }

  const url = `https://${instance}/tfs/${collection}/_apis/teams?api-version=4.1-preview.2`;
  console.log('fetchAllTeams url:', url);
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${pat}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production', // true in production
      }),
    });

    return response.data.value as Team[];
  } catch (error: any) {
    console.error('Error fetching teams:', error.message);
    throw error;
  }
};

// Function to Fetch Members of a Specific Team from TFS
const fetchTeamMembers = async (projectId: string, teamId: string): Promise<TeamMember[]> => {
  const instance = 'tfs.pacific.costcotravel.com';
  const collection = 'TestAutomation';
  const pat = process.env.TFS_AUTH_TOKEN;

  if (!instance || !collection || !pat) {
    throw new Error('Missing TFS_INSTANCE, TFS_COLLECTION, or TFS_PAT in environment variables.' + instance + collection + pat);
  }


  const url = `https://${instance}/tfs/${collection}/_apis/projects/${projectId}/teams/${teamId}/members?api-version=4.1`;
  console.log("fetchTeamMembers url:", url);
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${pat}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production', // true in production
      }),
    });

    return response.data.value.map((member: any) => ({
      id: member.identity.id,
      displayName: member.identity.displayName,
      uniqueName: member.identity.uniqueName,
      imageUrl: member.identity.imageUrl,
      descriptor: member.identity.descriptor,
      isTeamAdmin: member.isTeamAdmin,
    })) as TeamMember[];
  } catch (error: any) {
    console.error(`Error fetching members for team ${teamId}:`, error.message);
    throw error;
  }
};

// Function to Fetch All Teams and Their Members
const fetchAllTeamsAndMembers = async (): Promise<TeamWithMembers[]> => {
  const teams = await fetchAllTeams();

  const teamsWithMembersPromises = teams.map(async (team) => {
    const members = await fetchTeamMembers(team.projectId, team.id);
    return {
      team,
      members,
    };
  });

  return Promise.all(teamsWithMembersPromises);
};

// Type Definition for Teams with Members
type TeamWithMembers = {
  team: Team;
  members: TeamMember[];
};

// Function to Map Team Members to creatorIds
const mapCreators = (teamsWithMembers: TeamWithMembers[]): Record<string, string> => {
  const creatorIds: Record<string, string> = {};

  teamsWithMembers.forEach(({ team, members }) => {
    members.forEach(member => {
      // Map by uniqueName (e.g., "PACIFIC\\shilpa.thomas")
      creatorIds[member.uniqueName] = member.id;

      // If you prefer mapping by displayName, uncomment below:
      // const key = member.displayName.toLowerCase().replace(/\s+/g, '');
      // creatorIds[key] = member.id;
    });
  });

  return creatorIds;
};

// Function to Fetch creatorIds with Caching
const getCreatorIds = async (): Promise<Record<string, string>> => {
  const now = Date.now();

  if (cache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cache;
  }

  const teamsWithMembers = await fetchAllTeamsAndMembers();
  const creatorIds = mapCreators(teamsWithMembers);

  cache = creatorIds;
  cacheTimestamp = now;

  return creatorIds;
};

// API Route Handler
export async function GET() {
  const tfsBaseUrls: Record<Environment, string> = {
    QA: 'https://tfs.pacific.costcotravel.com/tfs/TestAutomation', // QA/SDET
    DEV: 'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel', // DEV
  };
  const authToken = process.env.TFS_AUTH_TOKEN 

  console.log('TFS Auth Token Present:', authToken ? 'Yes' : 'No');

  if (!authToken) {
    return NextResponse.json({ error: 'TFS_AUTH_TOKEN is not set.' }, { status: 500 });
  }

  const headers = {
    Authorization: `Basic ${authToken}`,
    'Content-Type': 'application/json',
  };

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Set to true in production for SSL validation
  });

  // Function to fetch pull requests based on repo, creator, and environment
  const fetchPullRequestsByRepoAndCreator = async (
    baseUrl: string,
    repoId: string,
    creatorId: string
  ) => {
    const pullRequestsUrl = `${baseUrl}/_apis/git/repositories/${repoId}/pullrequests?creatorId=${creatorId}&status=completed&api-version=4.1`;
    console.log("fetchPullRequestsByRepoAndCreator url:", pullRequestsUrl);
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
    // Step 1: Fetch creatorIds dynamically with caching
    const creatorIds = await getCreatorIds(); // Record<string, string> where key is uniqueName and value is id

    // TODO: Replace with dynamic API call to fetch all repos if needed
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

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // Include current month

    // Set to the first day of the month 12 months ago
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

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
        const pullRequests = await fetchPullRequestsByRepoAndCreator(baseUrl, repoId, creatorId);

        // Filter PRs closed within the last 12 months
        const filteredPullRequests = pullRequests.filter((pr: any) => {
          const closedDate = new Date(pr.closedDate);
          return closedDate >= twelveMonthsAgo && closedDate <= new Date();
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

        // Calculate time to merge for each PR
        const timeToMerge = filteredPullRequests.map((pr: any) => {
          const creation = new Date(pr.creationDate).getTime();
          const closed = new Date(pr.closedDate).getTime();
          return closed - creation;
        });

        // Calculate average time to merge
        const avgTimeToMerge =
          timeToMerge.length > 0
            ? timeToMerge.reduce((sum: number, time: number) => sum + time, 0) /
              timeToMerge.length
            : 0;

        // Gather reviewer stats
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

        // Calculate unique branches
        const uniqueBranches = new Set(
          filteredPullRequests.map((pr: any) => pr.sourceRefName)
        ).size;

        // Calculate auto-completed PRs
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

        // count PRs for each creator
        const creatorPRCount = filteredPullRequests.reduce((acc: Record<string, number>, pr: any) => {
          const creator = pr.createdBy?.displayName;
          if (creator) {
            acc[creator] = (acc[creator] || 0) + 1;
          }
          return acc;
        }, {});
        // Update metrics
        metrics[name].totalPRs += filteredPullRequests.length;

        // Calculate new average time to merge
        metrics[name].avgTimeToMerge =
          metrics[name].avgTimeToMerge
            ? (
                (metrics[name].avgTimeToMerge * (metrics[name].totalPRs - filteredPullRequests.length)) +
                avgTimeToMerge
              ) / metrics[name].totalPRs
            : avgTimeToMerge;

        metrics[name].positiveVotes += positiveVotes;
        metrics[name].neutralVotes += neutralVotes;
        metrics[name].negativeVotes += negativeVotes;
        metrics[name].uniqueBranches += uniqueBranches;
        metrics[name].autoCompletedPRs += autoCompletedPRs;
        metrics[name].fastMerges += filteredPullRequests.filter(
          (pr: any) =>
            pr.closedDate &&
            (new Date(pr.closedDate).getTime() - new Date(pr.creationDate).getTime()) < 2 * 60 * 60 * 1000 // Fast merge = under 2 hours
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
