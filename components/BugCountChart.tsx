// components/BugCountChart.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
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
import { ChartContainer } from './ui/chart';

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

interface BugCountPerFeature {
  featureId: number;
  featureTitle: string;
  openBugCount: number;
  closedBugCount: number;
}

const BugCountChart: React.FC = () => {
  const [bugCounts, setBugCounts] = useState<BugCountPerFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBugCounts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/bugs-per-feature');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch: ${response.statusText}`);
        }
        const data: BugCountPerFeature[] = await response.json();
        setBugCounts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBugCounts();
  }, []);

  const chartData = useMemo(() => {
    // Sort features by total bug count in descending order
    const sortedData = [...bugCounts].sort((a, b) => {
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
  }, [bugCounts]);

  const totalBugs = useMemo(
    () => bugCounts.reduce((acc, curr) => acc + curr.openBugCount + curr.closedBugCount, 0),
    [bugCounts]
  );

  // Calculate the chart height based on the number of data points
  const barSize = 30; // Fixed bar height
  const chartHeight = Math.max(chartData.length * barSize + (chartData.length - 1) * 4, 300); // Minimum height

  return (
    <Card className='w-full shadow-lg rounded-xl'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Bug Count by Feature</CardTitle>
        <CardDescription className='text-gray-400'>Feature-specific open and closed bug counts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className='animate-pulse'>
            <Skeleton height={200} />
          </div>
        )}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && bugCounts.length > 0 && (
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis type="number" stroke="#E0E0E0" />
              <YAxis
                dataKey="featureTitle"
                type="category"
                tickLine={false}
                axisLine={false}
                width={200}
                tick={{ fill: '#E0E0E0', fontSize: 12 }}
                tickFormatter={(value) =>
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
          </ChartContainer>
        )}
        {!loading && !error && bugCounts.length === 0 && (
          <p>No bug data available.</p>
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

// Custom Tooltip Component with dark theme styling
const CustomTooltip = ({ active, payload, label }: any) => {
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

export default BugCountChart;
