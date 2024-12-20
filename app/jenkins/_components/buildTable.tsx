'use client';
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
import { Clock } from 'lucide-react';
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
  // Fixed the typo from 'seTableCellata' to 'setTableData'
  const [data, setTableData] = useState<BuildData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jenkins');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result = await response.json();
        setTableData(result); // Corrected the setter function
        console.log('res', result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const openBuildDetails = (build: BuildData) => {
    setSelectedBuild(build);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBuild(null);
    setIsModalOpen(false);
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
  ];

  console.log(selectedBuild);

  return (
    <div className="relative">
      {/* Modal */}
      {isModalOpen && selectedBuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-6xl overflow-hidden">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">
                Failed Tests for {selectedBuild.trimmedDisplayName}{' '}
                <span className="text-green-500">#{selectedBuild.number}</span>
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {selectedBuild.failedTests && selectedBuild.failedTests.length > 0 ? (
                <ul className="space-y-2">
                  {selectedBuild.failedTests.map((test, i) => (
                    <div key={`${test}-${i}`}>
                      <li key={i}>
                        <Checkbox />
                        <a
                          href="#"
                          className="text-sm text-purple-600 dark:text-purple-400 hover:underline ml-4 break-all"
                        >
                          {test}
                        </a>
                      </li>
                    </div>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No failed tests available.</p>
              )}
            </div>

            <div className="mt-5 flex justify-between">
              <Button>Run Parameterized Test</Button> {/* If any tests are checked then show this */}
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

      {/* Job Selector */}
      <div className="items-center mb-2">
        <Select>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Build Table */}
      <Table className="border text-xs">
        <TableCaption>Jenkins Build Results</TableCaption>
        <TableHeader>
          <TableRow>
            {tableHeaders.map((header, index) => (
              <TableHead key={index} className="w-[100px]">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((build: BuildData, index: number) => {
            const failPercentage =
              build.totalCount > 0
                ? ((build.failCount / build.totalCount) * 100).toFixed(2)
                : '0.00';
            const cellStyles =
              'px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100';
            return (
              <TableRow
                key={`${build.number}-${build.trimmedDisplayName}-${index}`}
                className={`transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <TableCell className={`${cellStyles}`}>{build.trimmedDisplayName}</TableCell>
                <TableCell className={`${cellStyles}`}>
                  <Badge variant={'secondary'}>{build.number}</Badge>
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  <Badge
                    className={`${
                      build.result === 'FAILURE'
                        ? 'bg-red-600'
                        : build.result === 'SUCCESS'
                        ? 'bg-green-600'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {build.result}
                  </Badge>
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  {build.userName || 'N/A'}
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  <Badge variant={'secondary'}>{build.totalCount}</Badge>
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  <Badge variant={'destructive'}>{build.failCount}</Badge>
                </TableCell>
                <TableCell className={`${cellStyles}`}>{failPercentage}%</TableCell>
                <TableCell className={`${cellStyles}`}>{build.skipCount}</TableCell>
                <TableCell className={`${cellStyles}`}>
                  {build.timestamp ? new Date(build.timestamp).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  {(build.duration / 1000).toFixed(2)}s
                </TableCell>
                <TableCell className={`${cellStyles}`}>
                  <Button
                    onClick={() => openBuildDetails(build)}
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 px-3 py-1 rounded-md text-sm"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default JenkinsBuildTable;
