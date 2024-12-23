'use client'
import { BugsOverTimeChart } from '@/components/bugsOverTimeChart';
import React, { useEffect, useState } from 'react'
import { columns, SDETTable } from './columns';
import { DataTable } from './data-table';

type BugDetail = {
  id: number;
  fields: {
    "CostcoTravel.ActualEffort": number;
    "CostcoTravel.Environment": string;
    "CostcoTravel.Team": string;
    "Microsoft.VSTS.Common.ClosedDate"?: string;
    "Microsoft.VSTS.Common.Priority": number;
    "System.AssignedTo": string;
    "System.CreatedBy": string;
    "System.CreatedDate": string;
    "System.Id": number;
    "System.State": string;
    "System.Tags"?: string;
    "System.TeamProject": string;
    "System.Title": string;
    "System.WorkItemType": string;
  };
  url: string;
  timeOpenStats?: {
    bugId: number;
    totalHoursOpen: number;
    timeDiffHours: number;
    timeDiffDays: number;
  }[];
};

type ApiResponse = {
  bugCount: number;
  bugDetails: BugDetail[];
};




const UserProfile = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<SDETTable[] | undefined>(); 
  
  useEffect(() => {
    const fetchTFSData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tfs-user-profile');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch data: ${response.statusText}`
          );
        }
        const result: ApiResponse = await response.json();
        setData(result);

   
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTFSData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!data) return null; 

  const chartData = transformBugDetailsToChartData(data.bugDetails);

  return (
      <div className="px-4 py-8 space-y-10 w-full">
        {/* Page Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Quality Engineering Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Gain insights into bugs over time, and review the current testing assignments and results for your SDET teams.
          </p>
        </header>
    
     
        {tableData && (
          <section>
            <h2 className="text-xl font-semibold mb-4">At a Glance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Bugs */}
              <div className="border rounded-md p-4 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Total Bugs</h3>
                <p className="text-2xl font-bold">{data.bugCount}</p>
              </div>
    
              {/* SDETs */}
              <div className="border rounded-md p-4 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Total SDETs</h3>
                <p className="text-2xl font-bold">{tableData.length}</p>
              </div>
    
              {/* Average Passing % */}
              <div className="border rounded-md p-4 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground">Avg. Passing %</h3>
                <p className="text-2xl font-bold">
                  {(
                    tableData.reduce((acc, row) => acc + (row.percentPassing || 0), 0) /
                    tableData.length
                  ).toFixed(2)}%
                </p>
              </div>
            </div>
          </section>
        )}
    
        {/* Bugs Over Time Chart */}
        <section className="p-6 border rounded-md shadow-sm space-y-4">
          <h2 className="text-2xl font-bold">Bugs Over Time</h2>
          <p className="text-sm text-muted-foreground">
            Track how the number of bugs changes daily. See when bugs are opened and closed to identify trends and potential issues.
          </p>
          <BugsOverTimeChart externalChartData={chartData} totalBugCount={data.bugCount} />
        </section>
    
   
        {tableData && (
          <section className="p-6 border rounded-md shadow-sm space-y-4">
            <h2 className="text-2xl font-bold">SDET Assignments & Status</h2>
            <p className="text-sm text-muted-foreground">
              Review current SDET assignments, their team affiliations, and testing outcomes. Data includes testability, 
              environment, production, and existing bugs, as well as test pass percentages and last run metrics.
            </p>
            <DataTable data={tableData} columns={columns} />
          </section>
        )}
      </div>    
  );
};

/**
 * Transforms the bug details into a daily series for opened, closed, and total bugs.
 */
function transformBugDetailsToChartData(bugDetails: BugDetail[]) {
  const bugsOpenedByDate: Record<string, number> = {};
  const bugsClosedByDate: Record<string, number> = {};

  function toDateKey(dateString: string | undefined) {
    if (!dateString) return undefined;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split("T")[0];
  }

  for (const bug of bugDetails) {
    const createdDateKey = toDateKey(bug.fields["System.CreatedDate"]);
    if (createdDateKey) {
      bugsOpenedByDate[createdDateKey] = (bugsOpenedByDate[createdDateKey] || 0) + 1;
    }

    const closedDateKey = toDateKey(bug.fields["Microsoft.VSTS.Common.ClosedDate"]);
    if (closedDateKey) {
      bugsClosedByDate[closedDateKey] = (bugsClosedByDate[closedDateKey] || 0) + 1;
    }
  }

  const allDates = new Set(Object.keys(bugsOpenedByDate).concat(Object.keys(bugsClosedByDate)));
  const sortedDates = Array.from(allDates).sort((a, b) => +new Date(a) - +new Date(b));

  let runningTotal = 0;
  const dailyData = sortedDates.map(date => {
    const opened = bugsOpenedByDate[date] || 0;
    const closed = bugsClosedByDate[date] || 0;

    runningTotal += opened;
    runningTotal -= closed;
    return {
      date,
      bugs: runningTotal < 0 ? 0 : runningTotal, 
      bugsOpened: opened,
      bugsClosed: closed,
    };
  });

  return dailyData;
}

export default UserProfile;
