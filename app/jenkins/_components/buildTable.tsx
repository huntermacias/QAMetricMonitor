'use client';

import React, { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// -----------------------------------
//  INTERFACES
// -----------------------------------
interface BuildData {
  jobName?: string;
  fullDisplayName: string;
  trimmedDisplayName: string;
  timestamp: number;
  number: number;
  userName: string | null;
  duration: number;
  estimatedDuration: number;
  result: string;
  failCount: number;
  totalCount: number;
  skipCount: number;
  failedTests: string[];
  baselineFound?: boolean;
  calculatedPassCount?: number;
  teams: number[]; // Array of team numbers assigned to this build
}

// For sorting, we’ll allow these fields:
type SortField = 'trimmedDisplayName' | 'number' | 'timestamp' | 'userName';
type SortOrder = 'asc' | 'desc';

// Define the team names for better readability
const teamNames: Record<number, string> = {
  1: 'Team 1',
  2: 'Team 2',
  3: 'Team 3',
  4: 'Team 4',
  5: 'Team 5',
  6: 'Team 6',
  7: 'Team 7',
  8: 'Team 8',
};

// Map each job to its responsible teams
const jobToTeams: Record<string, number[]> = {
  '00_Shopping_UI_CRT_Agent_Tests': [6, 7],
  '01_Shopping_UI_CRT_Consumer_Part1': [1, 8],
  '02_Shopping_UI_CRT_Consumer_Part2': [2, 4],
  '03_Shopping_UI_CRT_Consumer_Part3': [3, 5],
  '03_Shopping_API_Service_Hotel_Search': [3, 5],
  '00_Shopping_API_APIConnect_Cruise': [6, 7],
  '00_Shopping_API_Service_Odysseus_Cruise': [2, 4],
  '01_Shopping_API_Service_Derby_Tickets': [1, 8],
};

// Sorting config
interface SortConfig {
  key: SortField;
  direction: SortOrder;
}

const JenkinsBuildTable = () => {
  // -----------------------------------
  //  STATE
  // -----------------------------------
  const [data, setTableData] = useState<BuildData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal state for viewing failed tests
  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // For triggering a new build
  const [selectedJobToRun, setSelectedJobToRun] = useState<string>('');

  // ----- FILTER & SORT States -----
  const [jobFilter, setJobFilter] = useState<string>('All'); // "All" or a specific job
  const [sdetFilter, setSdetFilter] = useState<string>('');  // text search on userName
  const [buildNoFilter, setBuildNoFilter] = useState<string>(''); // exact match on build number

  const [sortField, setSortField] = useState<SortField>('timestamp'); // default sort by timestamp
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // State to track expanded teams
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

  // -----------------------------------------
  // 1) FETCH ALL BUILDS
  // -----------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jenkins');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result: BuildData[] = await response.json();

        // Assign teams based on jobName
        const processedData: BuildData[] = result.map((build) => {
          const teams = jobToTeams[build.trimmedDisplayName] || [];
          return { ...build, teams };
        });

        setTableData(processedData);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  // -----------------------------------------
  // 2) UTILITY: Convert Jenkins "result" to simple states
  // -----------------------------------------
  const getDisplayResult = (jenkinsResult: string) => {
    switch (jenkinsResult?.toUpperCase()) {
      case 'SUCCESS':
        return 'SUCCESS';
      case 'FAILURE':
        return 'FAILED';
      case 'ABORTED':
        return 'ABORTED';
      case 'BUILDING':
        return 'BUILDING';
      default:
        // 'UNSTABLE', 'NOT_BUILT', etc. => treat as FAILED (or customize as needed)
        return 'FAILED';
    }
  };

  const getBadgeColorClass = (displayResult: string) => {
    switch (displayResult) {
      case 'SUCCESS':
        return 'bg-green-600';
      case 'FAILED':
        return 'bg-red-600';
      case 'ABORTED':
        return 'bg-gray-500';
      case 'BUILDING':
        return 'bg-yellow-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // -----------------------------------------
  // 3) MODAL HANDLERS
  // -----------------------------------------
  const openBuildDetails = (build: BuildData) => {
    setSelectedBuild(build);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBuild(null);
    setIsModalOpen(false);
  };

  // -----------------------------------------
  // 4) RERUN A BUILD
  // -----------------------------------------
  const rerunBuild = async (jobName: string) => {
    if (!jobName) return;
    try {
      const response = await fetch('/api/jenkins/runBuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobName,
          // If Jenkins job is parameterized, pass them here:
          parameters: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger build.');
      }

      const successData = await response.json();
      console.log(successData.message);

      // Optimistically add a "BUILDING" entry to our table:
      const newBuild: BuildData = {
        fullDisplayName: jobName,
        trimmedDisplayName: jobName,
        timestamp: Date.now(),
        number: Date.now(), // temporary unique ID
        userName: 'Rerun',
        duration: 0,
        estimatedDuration: 0,
        result: 'BUILDING',
        failCount: 0,
        totalCount: 0,
        skipCount: 0,
        failedTests: [],
        teams: jobToTeams[jobName] || [],
      };

      setTableData((prevData) => (prevData ? [newBuild, ...prevData] : [newBuild]));
    } catch (error: any) {
      console.error('❌ Error rerunning build:', error.message);
      alert(`Error rerunning build: ${error.message}`);
    }
  };

  // -----------------------------------------
  // 5) RERUN A JOB
  // -----------------------------------------
  const rerunJob = async (jobName: string) => {
    if (!jobName || jobName === 'All') return;
    await rerunBuild(jobName);
  };

  // -----------------------------------------
  // 6) GROUP BUILDS BY TEAM
  // -----------------------------------------
  const groupBuildsByTeam = (builds: BuildData[]): Record<number, BuildData[]> => {
    const teamToBuilds: Record<number, BuildData[]> = {};

    builds.forEach((build) => {
      build.teams.forEach((team) => {
        if (!teamToBuilds[team]) {
          teamToBuilds[team] = [];
        }
        teamToBuilds[team].push(build);
      });
    });

    return teamToBuilds;
  };

  // -----------------------------------------
  // 7) FILTERING AND SORTING
  // -----------------------------------------
  const getFilteredAndSortedData = useMemo((): Record<number, BuildData[]> => {
    if (!data) return {};

    // 1) Filter
    let filteredData = [...data];

    // (a) Filter by jobName (or "All")
    if (jobFilter !== 'All') {
      filteredData = filteredData.filter((build) => build.trimmedDisplayName === jobFilter);
    }

    // (b) Filter by SDET (userName)
    if (sdetFilter.trim().length > 0) {
      filteredData = filteredData.filter((build) =>
        build.userName
          ? build.userName.toLowerCase().includes(sdetFilter.toLowerCase())
          : false
      );
    }

    // (c) Filter by build number (exact match)
    if (buildNoFilter.trim().length > 0) {
      const num = parseInt(buildNoFilter, 10);
      if (!isNaN(num)) {
        filteredData = filteredData.filter((build) => build.number === num);
      }
    }

    // 2) Sort
    filteredData.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'trimmedDisplayName':
          valA = a.trimmedDisplayName.toLowerCase();
          valB = b.trimmedDisplayName.toLowerCase();
          break;
        case 'number':
          valA = a.number;
          valB = b.number;
          break;
        case 'timestamp':
          valA = a.timestamp;
          valB = b.timestamp;
          break;
        case 'userName':
          valA = a.userName?.toLowerCase() || '';
          valB = b.userName?.toLowerCase() || '';
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 3) Group by team
    const groupedData = groupBuildsByTeam(filteredData);

    return groupedData;
  }, [data, jobFilter, sdetFilter, buildNoFilter, sortField, sortOrder]);

  // -----------------------------------------
  // 8) TOGGLE TEAM EXPANSION
  // -----------------------------------------
  const toggleTeamExpansion = (team: number) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(team)) {
        newSet.delete(team);
      } else {
        newSet.add(team);
      }
      return newSet;
    });
  };

  // -----------------------------------------
  // 9) JOB LIST
  // -----------------------------------------
  const jobList = [
    'All', // added "All" to show everything
    '00_Shopping_UI_CRT_Agent_Tests',
    '01_Shopping_UI_CRT_Consumer_Part1',
    '02_Shopping_UI_CRT_Consumer_Part2',
    '03_Shopping_UI_CRT_Consumer_Part3',
    '03_Shopping_API_Service_Hotel_Search',
    '00_Shopping_API_APIConnect_Cruise',
    '00_Shopping_API_Service_Odysseus_Cruise',
    '01_Shopping_API_Service_Derby_Tickets',
  ];

  // -----------------------------------------
  // 10) TABLE HEADERS
  // -----------------------------------------
  const tableHeaders = [
    'Build Name',
    'Build No.',
    'Result',
    'SDET',
    'Total',
    'Failed',
    'Fail%',
    'Skipped',
    'Pass',
    'Pass%',
    'Baseline?',
    'Timestamp',
    'Duration',
    'Details',
    'Actions',
  ];

  // -----------------------------------------
  // 11) RENDER
  // -----------------------------------------
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="bg-red-800 text-red-200 p-6 rounded-lg shadow-lg">
          <p className="text-xl font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  // Get data after filters & sorting
  const groupedData = getFilteredAndSortedData;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* -----------------------------
          MODAL FOR FAILED TESTS
      ----------------------------- */}
      {isModalOpen && selectedBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-fit border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-4xl overflow-hidden relative">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h2 className="text-2xl text-white font-semibold tracking-wide">
                Failed Tests for <span className="text-green-400">{selectedBuild.trimmedDisplayName}</span>{' '}
                <span className="text-yellow-400">#{selectedBuild.number}</span>
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-200 transition-colors text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto">
              {selectedBuild.failedTests?.length > 0 ? (
                <ul className="space-y-3">
                  {selectedBuild.failedTests.map((test, i) => (
                    <li key={test + i} className="flex items-center space-x-3">
                      <Checkbox id={`checkbox-${i}`} />
                      <label
                        htmlFor={`checkbox-${i}`}
                        className="text-sm text-purple-300 hover:underline break-all cursor-pointer"
                      >
                        {test}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No failed tests available.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                className="border border-gray-600"
                variant={'secondary'}
                onClick={() => selectedBuild && rerunBuild(selectedBuild.trimmedDisplayName)}
              >
                Rerun Build
              </Button>
              <Button
                variant={'destructive'}
                onClick={closeModal}
                className="px-4 py-2 rounded-md text-gray-200 transition-colors"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------
          ADVANCED FILTERS & SORT
      ----------------------------- */}
      <div className="p-6 border rounded-lg shadow-md">
        <h2 className="text-xl text-white font-semibold mb-4">Filters & Sorting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Filter by Job */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter Job</label>
            <Select onValueChange={(value) => setJobFilter(value)} value={jobFilter}>
              <SelectTrigger className="w-full  text-gray-200 border border-gray-600 rounded-md">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className=" text-gray-200 border border-gray-600 rounded-md">
                <SelectGroup>
                  {jobList.map((job, index) => (
                    <SelectItem key={index} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by SDET */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter SDET</label>
            <input
              type="text"
              placeholder="e.g. john.doe"
              value={sdetFilter}
              onChange={(e) => setSdetFilter(e.target.value)}
              className="w-full px-4 py-2  text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Build No. */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Build No.</label>
            <input
              type="number"
              placeholder="e.g. 123"
              value={buildNoFilter}
              onChange={(e) => setBuildNoFilter(e.target.value)}
              className="w-full px-4 py-2  text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <Select onValueChange={(val) => setSortField(val as SortField)} value={sortField}>
              <SelectTrigger className="w-full  text-gray-200 border border-gray-600 rounded-md">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent className=" text-gray-200 border border-gray-600 rounded-md">
                <SelectGroup>
                  <SelectItem value="trimmedDisplayName">Job Name</SelectItem>
                  <SelectItem value="number">Build No.</SelectItem>
                  <SelectItem value="timestamp">Timestamp</SelectItem>
                  <SelectItem value="userName">SDET</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
            <Select onValueChange={(val) => setSortOrder(val as SortOrder)} value={sortOrder}>
              <SelectTrigger className="w-full text-gray-200 border border-gray-600 rounded-md">
                <SelectValue placeholder="Descending" />
              </SelectTrigger>
              <SelectContent className=" text-gray-200 border border-gray-600 rounded-md">
                <SelectGroup>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* -----------------------------
          JOB SELECTOR FOR RERUN
      ----------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 border p-6 rounded-lg shadow-md">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-300 mb-1">Select a Job to Rerun</label>
          <Select onValueChange={(value) => setSelectedJobToRun(value)} value={selectedJobToRun}>
            <SelectTrigger className="w-full  text-gray-200 border border-gray-600 rounded-md">
              <SelectValue placeholder="Select a Job to Rerun" />
            </SelectTrigger>
            <SelectContent className=" text-gray-200 border border-gray-600 rounded-md">
              <SelectGroup>
                {jobList.slice(1).map((job, index) => (
                  <SelectItem key={index} value={job}>
                    {job}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => rerunJob(selectedJobToRun)}
          disabled={!selectedJobToRun || selectedJobToRun === 'All'}
          className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md"
        >
          Rerun Selected Job
        </Button>
      </div>

      {/* -----------------------------
          BUILD TABLE GROUPED BY TEAM
      ----------------------------- */}
      <div className="overflow-hidden rounded-lg border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
        <Table className="min-w-full text-sm text-gray-200">
          <TableCaption className="text-base font-semibold text-gray-300 mb-4">
            Jenkins Build Results Grouped by Team
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="py-3 px-6 text-left font-medium uppercase tracking-wider">
                Team
              </TableHead>
              <TableHead className="py-3 px-6 text-left font-medium uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className=" divide-y divide-gray-700">
            {Object.keys(groupedData).length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="px-6 py-4 text-center text-gray-400">
                  No builds match your filters.
                </TableCell>
              </TableRow>
            )}

            {Object.entries(groupedData).map(([teamNumberStr, builds]) => {
              const teamNumber = parseInt(teamNumberStr, 10);
              const teamName = teamNames[teamNumber] || `Team ${teamNumber}`;
              const isExpanded = expandedTeams.has(teamNumber);

              return (
                <React.Fragment key={teamNumber}>
                  {/* Team Row */}
                  <TableRow className="">
                    <TableCell className="py-2 px-6 font-semibold text-gray-200">
                      <button
                        onClick={() => toggleTeamExpansion(teamNumber)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        {isExpanded ? (
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                        <span>{teamName}</span>
                      </button>
                    </TableCell>
                    <TableCell className="py-2 px-6">
                      {/* Placeholder for team-level actions if needed */}
                    </TableCell>
                  </TableRow>

                  {/* Build Rows */}
                  {isExpanded && builds.map((build: BuildData) => {
                    const displayResult = getDisplayResult(build.result);
                    const badgeColorClass = getBadgeColorClass(displayResult);

                    const passCount =
                      typeof build.calculatedPassCount === 'number'
                        ? build.calculatedPassCount
                        : build.totalCount - build.failCount - build.skipCount;

                    const failPercentage =
                      build.totalCount > 0
                        ? ((build.failCount / build.totalCount) * 100).toFixed(2)
                        : '0.00';
                    const passPercentage =
                      build.totalCount > 0
                        ? ((passCount / build.totalCount) * 100).toFixed(2)
                        : '0.00';

                    return (
                      <TableRow
                        key={`${build.number}-${build.trimmedDisplayName}-${teamNumber}`}
                        className="hover:bg-gray-600 transition-colors"
                      >
                        {/* Build Name */}
                        <TableCell className="py-2 px-6">
                          <div className="flex items-center space-x-4">
                            <Badge className={`px-2 py-1 rounded ${badgeColorClass}`}>
                              {displayResult}
                            </Badge>
                            <div>
                              <p className="text-white font-medium">{build.trimmedDisplayName}</p>
                              <p className="text-gray-400 text-xs">Build #{build.number}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-2 px-6">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => openBuildDetails(build)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-xs transition-colors"
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() => rerunBuild(build.trimmedDisplayName)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-md text-xs transition-colors"
                            >
                              Rerun
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JenkinsBuildTable;
