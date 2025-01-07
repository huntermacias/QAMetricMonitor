// app/jenkins/_components/JenkinsTeamsView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TEAMS } from '../teamDefinitions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface JenkinsTeamsViewProps {
  builds: BuildData[];
}

export default function JenkinsTeamsView({ builds }: any) {
  const [filterJobName, setFilterJobName] = useState<string>('All');
  const [filterResult, setFilterResult] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Derive unique job names from builds for the filter dropdown
  const uniqueJobNames = useMemo(() => {
    const jobNames = builds.map((build:any) => build.trimmedDisplayName);
    return Array.from(new Set(jobNames));
  }, [builds]);

  // Handle filtering logic
  const filteredTeams = useMemo(() => {
    return TEAMS.map((team:any) => {
      const teamBuilds = builds.filter((build : any) =>
        team.jobNames.includes(build.trimmedDisplayName)
      );

      // Apply filters
      let filteredBuilds = teamBuilds;

      if (filterJobName !== 'All') {
        filteredBuilds = filteredBuilds.filter(
          (build : any) => build.trimmedDisplayName === filterJobName
        );
      }

      if (filterResult !== 'All') {
        filteredBuilds = filteredBuilds.filter(
          (build : any) => build.result.toLowerCase() === filterResult.toLowerCase()
        );
      }

      if (searchTerm.trim() !== '') {
        filteredBuilds = filteredBuilds.filter(
          (build : any) =>
            build.trimmedDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            build.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return { ...team, builds: filteredBuilds };
    });
  }, [TEAMS, builds, filterJobName, filterResult, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Job Name Filter */}
        <div className="flex flex-col">
          <Label htmlFor="jobName">Filter by Job Name</Label>
          <Select
            onValueChange={(value) => setFilterJobName(value)}
            value={filterJobName}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All</SelectItem>
                {uniqueJobNames.map((job:any, index) => (
                  <SelectItem key={index} value={job}>
                    {job}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Result Filter */}
        <div className="flex flex-col">
          <Label htmlFor="result">Filter by Result</Label>
          <Select
            onValueChange={(value) => setFilterResult(value)}
            value={filterResult}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILURE">Failure</SelectItem>
                <SelectItem value="ABORTED">Aborted</SelectItem>
                <SelectItem value="BUILDING">Building</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="flex flex-col flex-grow">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by Job Name or SDET"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-96"
          />
        </div>

        {/* Reset Filters Button */}
        <div className="flex flex-col">
          <Label>&nbsp;</Label>
          <Button
            variant="ghost"
            onClick={() => {
              setFilterJobName('All');
              setFilterResult('All');
              setSearchTerm('');
            }}
            className="w-48"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Teams Table */}
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead># of Builds</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeams.map((team:any) => {
            const hasBuilds = team.builds.length > 0;
            return (
              <React.Fragment key={team.name}>
                {/* Team Row */}
                <TableRow className="">
                  <TableCell className="font-semibold">{team.name}</TableCell>
                  <TableCell>{team.builds.length}</TableCell>
                  <TableCell>
                    {hasBuilds ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Toggle Build Details"
                          >
                            <ChevronDown />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          {/* Nested Builds Table */}
                          <Table className="min-w-full mt-2">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Job Name</TableHead>
                                <TableHead>Build No.</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>SDET</TableHead>
                                <TableHead>Failed</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {team.builds.map((build:any) => (
                                <TableRow
                                  key={`${build.number}-${build.trimmedDisplayName}`}
                                  className=""
                                >
                                  <TableCell>{build.trimmedDisplayName}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{build.number}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${
                                        build.result === 'SUCCESS'
                                          ? 'bg-green-600'
                                          : build.result === 'FAILURE'
                                          ? 'bg-red-600'
                                          : build.result === 'ABORTED'
                                          ? 'bg-gray-500'
                                          : 'bg-yellow-500'
                                      } text-white`}
                                    >
                                      {build.result}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{build.userName || 'N/A'}</TableCell>
                                  <TableCell>{build.failCount}</TableCell>
                                  <TableCell>{build.totalCount}</TableCell>
                                  <TableCell>
                                    {new Date(build.timestamp).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          aria-label="More Actions"
                                        >
                                          <MoreHorizontal />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Rerun Build</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                          Delete Build
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <span className="text-gray-500">No builds available</span>
                    )}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
