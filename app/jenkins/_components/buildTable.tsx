'use client';
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
import React, { useEffect, useState } from 'react';

interface BuildData {
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
}

const JenkinsBuildTable = () => {
  const [data, setTableData] = useState<BuildData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [selectedJob, setSelectedJob] = useState<string>(''); // use to trigger a build

  
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

  // --- Convert raw Jenkins result to one of [ 'SUCCESS', 'ABORTED', 'FAILED', 'BUILDING' ] ---
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
        // Some jobs might show 'UNSTABLE' or 'NOT_BUILT', map these to 'FAILED' or whatever we want
        return 'FAILED';
    }
  };

  // --- Determine the correct badge color class based on final display result ---
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

  // --- Modal actions ---
  const openBuildDetails = (build: BuildData) => {
    setSelectedBuild(build);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedBuild(null);
    setIsModalOpen(false);
  };

  // --- Trigger a build (rerun) ---
  const rerunBuild = async (jobName: string) => {
    if (!jobName) return;
    try {
      const response = await fetch('/api/jenkins/runBuild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobName,
          // might need to update jenkins jobs if parameterized tests aren't supported
          parameters: {}, // Pass parameters if your Jenkins job needs them
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger build.');
      }

      const successData = await response.json();
      console.log(successData.message);

      // Optimistically add the build to the table with 'BUILDING' status
      const newBuild: BuildData = {
        fullDisplayName: jobName,
        trimmedDisplayName: jobName,
        timestamp: Date.now(), // TODO: update with timestamp that build was executed
        number: Date.now(), // Temporary unique identifier; TODO: update with actual build number
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


  if (error) {
    return <div className="text-red-600 p-4 font-bold">Error: {error}</div>;
  }
  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  const jobList = [
    '00_Shopping_UI_CRT_Agent_Tests',
    '01_Shopping_UI_CRT_Consumer_Part1',
    '02_Shopping_UI_CRT_Consumer_Part2',
    '03_Shopping_UI_CRT_Consumer_Part3',
    '00_Shopping_API_APIConnect_Cruise',
    '00_Shopping_API_Service_Odysseus_Cruise',
    '01_Shopping_API_Service_Derby_Tickets',
  ];

  const tableHeaders = [
    'Build Name',
    'Build No.',
    'Result',
    'SDET',
    'Total',
    'Failed',
    '%',
    'Bugs',
    'Timestamp',
    'Duration',
    'Details',
    'Actions', 
  ];

  return (
    <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/*  Modal for Failed Tests  */}
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
              {selectedBuild.failedTests && selectedBuild.failedTests.length > 0 ? (
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
              <Button onClick={() => selectedBuild && rerunBuild(selectedBuild.trimmedDisplayName)}>
                Rerun Build
              </Button>
              <Button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 transition-colors"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/*  Job Selector  */}
      <div className="flex items-center space-x-4 mb-5 mt-4">
        <Select onValueChange={(value) => setSelectedJob(value)} value={selectedJob}>
          <SelectTrigger className="w-[220px] shadow-sm focus:ring-2 focus:ring-purple-500">
            <SelectValue placeholder="Select a Job" />
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
        <Button
          onClick={() => rerunBuild(selectedJob)}
          disabled={!selectedJob}
          className="transition-colors"
        >
          Rerun Selected Job
        </Button>
      </div>

      {/*  Build Table  */}
      <div className="overflow-hidden rounded-lg border shadow-md hover:shadow-lg transition-shadow duration-300">
        <Table className="min-w-full divide-y divide-gray-200 text-xs">
          <TableCaption className="text-sm font-medium">
            Jenkins Build Results
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              {tableHeaders.map((header, index) => (
                <TableHead
                  key={index}
                  className="py-3 px-2 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-900">
            {data.map((build: BuildData, index: number) => {
              // Convert Jenkins result -> [ 'SUCCESS', 'FAILED', 'ABORTED', 'BUILDING' ] TODO: verify state names
              const displayResult = getDisplayResult(build.result);
              const badgeColorClass = getBadgeColorClass(displayResult);

              const failPercentage =
                build.totalCount > 0
                  ? ((build.failCount / build.totalCount) * 100).toFixed(2)
                  : '0.00';

              return (
                <TableRow
                  key={build.number + build.trimmedDisplayName + index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <TableCell className="py-2 px-2 font-medium">
                    {build.trimmedDisplayName}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.number}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge className={`${badgeColorClass} text-white`}>
                      {displayResult}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    {build.userName || 'N/A'}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.totalCount}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="destructive">{build.failCount}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">{failPercentage}%</TableCell>
                  <TableCell className="py-2 px-2">{build.skipCount}</TableCell>
                  <TableCell className="py-2 px-2">
                    {build.timestamp ? new Date(build.timestamp).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    {(build.duration / 1000).toFixed(2)}s
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Button
                      onClick={() => openBuildDetails(build)}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 px-3 py-1 rounded-md text-xs"
                    >
                      View
                    </Button>
                  </TableCell>
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
