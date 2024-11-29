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

const chartConfig = {
  openBugs: {
    label: 'Open Bugs',
    color: 'hsl(var(--chart-1))',
  },
  closedBugs: {
    label: 'Closed Bugs',
    color: 'hsl(var(--chart-2))',
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
    return sortedData.map((feature) => ({
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
  const chartHeight = chartData.length * barSize + (chartData.length - 1) * 4; // 4px gap between bars

  return (
    <Card className='w-1/2'>
      <CardHeader>
        <CardTitle>Bug Count by Feature</CardTitle>
        <CardDescription>Feature-specific open and closed bug counts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading bug data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && bugCounts.length > 0 && (
          <div style={{ height: '500px', overflowY: 'auto' }}>
            <BarChart
              width={800}
              height={chartHeight}
              data={chartData}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="featureTitle"
                type="category"
                tickLine={false}
                axisLine={false}
                width={250}
                tickMargin={10}
                tickFormatter={(value) =>
                  value.length > 30 ? `${value.slice(0, 30)}...` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="closedBugCount"
                name="Closed Bugs"
                stackId="a"
                fill={chartConfig.closedBugs.color}
                barSize={barSize}
              />
              <Bar
                dataKey="openBugCount"
                name="Open Bugs"
                stackId="a"
                fill={chartConfig.openBugs.color}
                barSize={barSize}
              />
            </BarChart>
          </div>
        )}
        {!loading && !error && bugCounts.length === 0 && (
          <p>No bug data available.</p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Total Bugs: {totalBugs} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Scroll to view all features and their bug counts
        </div>
      </CardFooter>
    </Card>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalBugs = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    return (
      <div className="bg-white border rounded-md p-2 shadow-lg">
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
