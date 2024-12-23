'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
}

// For sorting, we’ll allow these fields:
type SortField = 'trimmedDisplayName' | 'number' | 'timestamp' | 'userName';
type SortOrder = 'asc' | 'desc';

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
        const result = await response.json();
        setTableData(result);
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
      case 'building':
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
      };

      setTableData((prevData) => (prevData ? [newBuild, ...prevData] : [newBuild]));
    } catch (error: any) {
      console.error('❌ Error rerunning build:', error.message);
      alert(`Error rerunning build: ${error.message}`);
    }
  };

  // -----------------------------------------
  // 5) FILTERING AND SORTING
  // -----------------------------------------
  const getFilteredAndSortedData = (): BuildData[] => {
    if (!data) return [];

    // 1) Filter
    let filteredData = [...data];

    // (a) Filter by jobName (or "All")
    if (jobFilter !== 'All') {
      filteredData = filteredData.filter((build) => {
        // Some Jenkins jobs might store jobName in build.jobName,
        // or you can match the trimmedDisplayName. Adjust as needed.
        // We'll check both:
        const candidate = build.jobName || build.trimmedDisplayName;
        return candidate === jobFilter;
      });
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
      filteredData = filteredData.filter((build) => build.number === num);
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

    return filteredData;
  };

  // -----------------------------------------
  // 6) RENDER
  // -----------------------------------------
  if (error) {
    return <div className="text-red-600 p-4 font-bold">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  // Job list for the "Rerun" section; might reuse same for filter
  const jobList = [
    'All', // added "All" to show everything
    '00_Shopping_UI_CRT_Agent_Tests',
    '01_Shopping_UI_CRT_Consumer_Part1',
    '02_Shopping_UI_CRT_Consumer_Part2',
    '03_Shopping_UI_CRT_Consumer_Part3',
    '00_Shopping_API_APIConnect_Cruise',
    '00_Shopping_API_Service_Odysseus_Cruise',
    '01_Shopping_API_Service_Derby_Tickets',
  ];

  // Table headers
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

  // Get data after filters & sorting
  const displayData = getFilteredAndSortedData();

  return (
    <div className="space-y-4">
      {/* -----------------------------
          MODAL FOR FAILED TESTS
      ----------------------------- */}
      {isModalOpen && selectedBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-background border rounded-lg shadow-2xl p-6 w-full max-w-6xl overflow-hidden relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl text-gray-900 dark:text-gray-100 font-semibold tracking-wide">
                Failed Tests for {selectedBuild.trimmedDisplayName}{' '}
                <span className="text-green-500">#{selectedBuild.number}</span>
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors text-xl"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {selectedBuild.failedTests?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedBuild.failedTests.map((test, i) => (
                    <li key={test + i} className="flex items-center space-x-2">
                      <Checkbox id={`checkbox-${i}`} />
                      <label
                        htmlFor={`checkbox-${i}`}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline break-all cursor-pointer"
                      >
                        {test}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No failed tests available.</p>
              )}
            </div>

            <div className="mt-5 flex justify-end space-x-3">
              <Button className='border' variant={'secondary'} onClick={() => selectedBuild && rerunBuild(selectedBuild.trimmedDisplayName)}>
                Rerun Build
              </Button>
              <Button
                variant={'destructive'}
                onClick={closeModal}
                className="px-4 py-2 rounded-md text-gray-800 dark:text-gray-200 transition-colors"
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
      <div className="p-4 border rounded-md shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter by job */}
          <div className="flex flex-col w-44">
            <label className="mb-1 text-sm font-semibold">
              Filter Job
            </label>
            <Select onValueChange={(value) => setJobFilter(value)} value={jobFilter}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
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
          <div className="flex flex-col w-44">
            <label className="mb-1 text-sm font-semibold">
              Filter SDET
            </label>
            <input
              type="text"
              placeholder="e.g. john.doe"
              value={sdetFilter}
              onChange={(e) => setSdetFilter(e.target.value)}
              className="rounded-md  p-2"
            />
          </div>

          {/* Filter by Build No. */}
          <div className="flex flex-col w-44">
            <label className="mb-1 text-sm font-semibold">
              Build No.
            </label>
            <input
              type="number"
              placeholder="e.g. 123"
              value={buildNoFilter}
              onChange={(e) => setBuildNoFilter(e.target.value)}
              className="rounded-md p-2"
            />
          </div>

          {/* Sort Field */}
          <div className="flex flex-col w-44">
            <label className="mb-1 text-sm font-semibold">
              Sort By
            </label>
            <Select onValueChange={(val) => setSortField(val as SortField)} value={sortField}>
              <SelectTrigger className="shadow-sm ">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
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
          <div className="flex flex-col w-32">
            <label className="mb-1 text-sm font-semibold">
              Order
            </label>
            <Select onValueChange={(val) => setSortOrder(val as SortOrder)} value={sortOrder}>
              <SelectTrigger className="shadow-sm ">
                <SelectValue placeholder="desc" />
              </SelectTrigger>
              <SelectContent>
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
      <div className="flex items-center space-x-4">
        <Select onValueChange={(value) => setSelectedJobToRun(value)} value={selectedJobToRun}>
          <SelectTrigger className="w-[220px] shadow-sm ">
            <SelectValue placeholder="Select a Job to Rerun" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {jobList.slice(1).map((job, index) => (
                <SelectItem key={index} value={job}>
                  {job}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          onClick={() => rerunBuild(selectedJobToRun)}
          disabled={!selectedJobToRun || selectedJobToRun === 'All'}
          className="transition-colors"
        >
          Rerun Selected Job
        </Button>
      </div>

      {/* -----------------------------
          BUILD TABLE
      ----------------------------- */}
      <div className="overflow-hidden rounded-lg border shadow-md hover:shadow-lg transition-shadow duration-300">
        <Table className="min-w-full text-xs">
          <TableCaption className="text-sm font-medium">Jenkins Build Results</TableCaption>
          <TableHeader>
            <TableRow className="">
              {tableHeaders.map((header, index) => (
                <TableHead
                  key={index}
                  className="py-3 px-2 font-bold uppercase tracking-wider"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="">
            {displayData.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="p-4 text-center">
                  No builds match your filters.
                </TableCell>
              </TableRow>
            )}
            {displayData.map((build, index) => {
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
                  key={`${build.number}-${build.trimmedDisplayName}-${index}`}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Build Name */}
                  <TableCell className="py-2 px-2 font-medium">
                    {build.trimmedDisplayName}
                  </TableCell>

                  {/* Build Number */}
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.number}</Badge>
                  </TableCell>

                  {/* Result */}
                  <TableCell className="py-2 px-2">
                    <Badge className={`${badgeColorClass} text-white`}>{displayResult}</Badge>
                  </TableCell>

                  {/* SDET / User */}
                  <TableCell className="py-2 px-2">{build.userName || 'N/A'}</TableCell>

                  {/* Total */}
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.totalCount}</Badge>
                  </TableCell>

                  {/* Failed */}
                  <TableCell className="py-2 px-2">
                    <Badge variant="destructive">{build.failCount}</Badge>
                  </TableCell>

                  {/* Fail% */}
                  <TableCell className="py-2 px-2">{failPercentage}%</TableCell>

                  {/* Skipped */}
                  <TableCell className="py-2 px-2">{build.skipCount}</TableCell>

                  {/* Pass */}
                  <TableCell className="py-2 px-2">{passCount}</TableCell>

                  {/* Pass% */}
                  <TableCell className="py-2 px-2">{passPercentage}%</TableCell>

                  {/* Baseline? */}
                  <TableCell className="py-2 px-2">
                    {build.baselineFound ? (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Yes
                      </Badge>
                    ) : (
                      'No'
                    )}
                  </TableCell>

                  {/* Timestamp */}
                  <TableCell className="py-2 px-2">
                    {build.timestamp ? new Date(build.timestamp).toLocaleString() : 'N/A'}
                  </TableCell>

                  {/* Duration (seconds) */}
                  <TableCell className="py-2 px-2">
                    {(build.duration / 1000).toFixed(2)}s
                  </TableCell>

                  {/* View Details */}
                  <TableCell className="py-2 px-2">
                    <Button
                      onClick={() => openBuildDetails(build)}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 px-3 py-1 rounded-md text-xs"
                    >
                      View
                    </Button>
                  </TableCell>

                  {/* Re-run Build */}
                  <TableCell className="py-2 px-2">
                    <Button
                      onClick={() => rerunBuild(build.trimmedDisplayName)}
                      className="bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200 px-3 py-1 rounded-md text-xs"
                    >
                      Rerun
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JenkinsBuildTable;
