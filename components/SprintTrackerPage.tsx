// app/components/SprintTrackerPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; 
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Alert } from '@/components/ui/alert'; 
import { TrendingUp } from 'lucide-react';
import { SprintDetail } from '@/types/tfs'; 

const SprintTrackerPage: React.FC = () => {
  const [data, setData] = useState<SprintDetail[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchSprintDetails = async () => {
      try {
        const response = await axios.get<SprintDetail[]>('/api/sprint-tracker');
        setData(response.data);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching sprint details:', error);
        setErrorMessage(error.message || 'Failed to load sprint details.');
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchSprintDetails();
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Sprint Tracker
          </CardTitle>
          <CardDescription className="text-gray-400">
            Details of Shopping Team 01's current sprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <Skeleton count={10} height={40} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex items-center gap-2 font-medium text-[#FFD700]">
            Total Work Items: {data ? data.length : 0} <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="w-full shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Sprint Tracker
          </CardTitle>
          <CardDescription className="text-gray-400">
            Details of Shopping Team 01's current sprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
          errorrr
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex items-center gap-2 font-medium text-[#FFD700]">
            Total Work Items: {data ? data.length : 0} <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Render data
  return (
    <Card className="w-full shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Sprint Tracker</CardTitle>
        <CardDescription className="text-gray-400">
          Details of Shopping Team 01's current sprint
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Assigned To</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">State</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Tags</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {data.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.workItemType}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.assignedTo}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.state}</td>
                    <td className="px-4 py-2 text-sm text-gray-200">{row.tags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No sprint details available.</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="flex items-center gap-2 font-medium text-[#FFD700]">
          Total Work Items: {data ? data.length : 0} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default SprintTrackerPage;
