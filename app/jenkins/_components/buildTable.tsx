// app/jenkins/_components/buildTable.tsx
'use client';
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define the BuildData interface if not already defined
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

interface JenkinsBuildTableProps {
  builds: BuildData[];
}

const JenkinsBuildTable = ({ builds }: any) => {
  // Utility functions (same as in your original code)
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

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full text-xs">
        <TableCaption className="text-sm font-medium">Jenkins Build Results</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Build Name</TableHead>
            <TableHead>Build No.</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>SDET</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Failed</TableHead>
            <TableHead>Fail%</TableHead>
            <TableHead>Skipped</TableHead>
            <TableHead>Pass</TableHead>
            <TableHead>Pass%</TableHead>
            <TableHead>Baseline?</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {builds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} className="p-4 text-center">
                No builds available.
              </TableCell>
            </TableRow>
          ) : (
            builds.map((build:any, index:number) => {
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
                <TableRow key={`${build.number}-${build.trimmedDisplayName}-${index}`} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <TableCell className="py-2 px-2 font-medium">{build.trimmedDisplayName}</TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.number}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge className={`${badgeColorClass} text-white`}>{displayResult}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">{build.userName || 'N/A'}</TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="secondary">{build.totalCount}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Badge variant="destructive">{build.failCount}</Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2">{failPercentage}%</TableCell>
                  <TableCell className="py-2 px-2">{build.skipCount}</TableCell>
                  <TableCell className="py-2 px-2">{passCount}</TableCell>
                  <TableCell className="py-2 px-2">{passPercentage}%</TableCell>
                  <TableCell className="py-2 px-2">
                    {build.baselineFound ? (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Yes
                      </Badge>
                    ) : (
                      'No'
                    )}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    {build.timestamp ? new Date(build.timestamp).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    {(build.duration / 1000).toFixed(2)}s
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-1 rounded-md text-xs">
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="py-2 px-2">
                    <Button className="bg-orange-600 text-white hover:bg-orange-700 transition-colors px-3 py-1 rounded-md text-xs">
                      Rerun
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JenkinsBuildTable;
