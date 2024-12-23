// components/BugCountChart.tsx

'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useQuery } from 'react-query';
import axios from 'axios';

// Updated color palette for dark theme
const chartConfig = {
  openBugs: {
    label: 'Open Bugs',
    color: '#FF4C4C', // Bright Red
  },
  closedBugs: {
    label: 'Closed Bugs',
    color: '#4CAF50', // Vibrant Green
  },
} satisfies Record<string, { label: string; color: string }>;

// TypeScript Interfaces
interface FeatureBugMetrics {
  featureId: number;
  featureTitle: string;
  openBugCount: number;
  closedBugCount: number;
  averageOpenBugAgeDays: number | null;
  averageClosedBugLifetimeDays: number | null;
}

interface FetchError {
  error: string;
}

// Custom Tooltip Component with dark theme styling
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalBugs = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    return (
      <div className="bg-[#333333] text-[#E0E0E0] p-3 rounded-md shadow-lg">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="text-xs font-semibold">Total Bugs: {totalBugs}</p>
      </div>
    );
  }

  return null;
};

const BugCountChart: React.FC = () => {
  // Fetch bug counts using React Query
  const { data, isLoading, isError, error } = useQuery<FeatureBugMetrics[], FetchError>(
    'bugCounts',
    async () => {
      const response = await axios.get('/api/bugs-per-feature');
      return response.data;
    },
    {
      retry: 2, // Retry twice on failure
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      onError: (err: any) => {
        console.error('Error fetching bug counts:', err); // this is happening
      },
    }
  );

  // Memoize processed chart data
  const chartData = useMemo(() => {
    if (!data) return [];

    // Sort features by total bug count in descending order
    const sortedData = [...data].sort((a, b) => {
      const totalBugsA = a.openBugCount + a.closedBugCount;
      const totalBugsB = b.openBugCount + b.closedBugCount;
      return totalBugsB - totalBugsA;
    });

    // Filter out features with zero bugs and map the data
    return sortedData
      .filter((bug) => bug.openBugCount > 0 || bug.closedBugCount > 0)
      .map((feature) => ({
        featureTitle: feature.featureTitle,
        openBugCount: feature.openBugCount,
        closedBugCount: feature.closedBugCount,
      }));
  }, [data]);

  // Calculate the total number of bugs
  const totalBugs = useMemo(
    () => (data ? data.reduce((acc:any, curr:any) => acc + curr.openBugCount + curr.closedBugCount, 0) : 0),
    [data]
  );

  // Determine the chart height based on the number of data points
  const barSize = 30; // Fixed bar height
  const chartHeight = useMemo(() => {
    if (chartData.length === 0) return 300;
    return Math.min(chartData.length * barSize + (chartData.length - 1) * 4, 600); // Limit maximum height
  }, [chartData.length]);

  return (
    <Card className="w-full shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Bug Count by Feature</CardTitle>
        <CardDescription className="text-gray-400">
          Feature-specific open and closed bug counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="animate-pulse">
            <Skeleton height={chartHeight} />
          </div>
        )}
        {isError && (
          <p className="text-red-500">Error: {error?.error || 'Failed to load data.'}</p>
        )}
        {!isLoading && !isError && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 100, right: 30, top: 20, bottom: 20 }}
            >
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis
                type="number"
                stroke="#E0E0E0"
                tick={{ fill: '#E0E0E0' }}
                allowDecimals={false}
              />
              <YAxis
                dataKey="featureTitle"
                type="category"
                tickLine={false}
                axisLine={false}
                width={200}
                tick={{ fill: '#E0E0E0', fontSize: 12 }}
                tickFormatter={(value: string) =>
                  value.length > 30 ? `${value.slice(0, 30)}...` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#E0E0E0' }} />
              <Bar
                dataKey="closedBugCount"
                name={chartConfig.closedBugs.label}
                stackId="a"
                fill={chartConfig.closedBugs.color}
                barSize={barSize}
              />
              <Bar
                dataKey="openBugCount"
                name={chartConfig.openBugs.label}
                stackId="a"
                fill={chartConfig.openBugs.color}
                barSize={barSize}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        {!isLoading && !isError && chartData.length === 0 && (
          <p className="text-gray-400">No bug data available.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-[#FFD700]">
          Total Bugs: {totalBugs} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-gray-500">
          Scroll to view all features and their bug counts
        </div>
      </CardFooter>
    </Card>
  );
};

export default BugCountChart;
