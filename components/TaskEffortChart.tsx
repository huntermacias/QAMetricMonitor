// components/TaskEffortChart.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

/**
 * Interface representing the structure of a Task with Efforts.
 */
interface TaskEffort {
  taskId: number;
  taskTitle: string;
  sizingEffort: number; // e.g., Story Points
  actualEffort: number; // e.g., Hours
}

const TaskEffortChart: React.FC = () => {
  const [taskEfforts, setTaskEfforts] = useState<TaskEffort[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch task efforts from the API
  useEffect(() => {
    const fetchTaskEfforts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/effort-trend');
        console.log('API Response Status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Data:', errorData);
          throw new Error(errorData.error || `Failed to fetch task efforts: ${response.statusText}`);
        }
        const data: TaskEffort[] = await response.json();
        console.log('Fetched Task Efforts Data:', data);
        setTaskEfforts(data);
      } catch (err: any) {
        console.error('Error fetching task efforts:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskEfforts();
  }, []);

  // Prepare data for Recharts
  const chartData = useMemo(
    () =>
      taskEfforts.map((task) => ({
        taskTitle: task.taskTitle,
        sizingEffort: task.sizingEffort,
        actualEffort: task.actualEffort,
      })),
    [taskEfforts]
  );

  // Calculate statistics
  const averageSizingEffort = useMemo(() => {
    if (taskEfforts.length === 0) return 0;
    const total = taskEfforts.reduce((acc, curr) => acc + curr.sizingEffort, 0);
    return total / taskEfforts.length;
  }, [taskEfforts]);

  const averageActualEffort = useMemo(() => {
    if (taskEfforts.length === 0) return 0;
    const total = taskEfforts.reduce((acc, curr) => acc + curr.actualEffort, 0);
    return total / taskEfforts.length;
  }, [taskEfforts]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Task Effort Trends</CardTitle>
          <CardDescription>
            Analyzing the relationship between sizing effort and actual hours spent
          </CardDescription>
        </div>
        <div className="flex items-center space-x-4 px-6 py-5 sm:py-6">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              Total Tasks: {taskEfforts.length}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Avg Sizing Effort: {averageSizingEffort.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Avg Actual Effort: {averageActualEffort.toFixed(2)} hrs
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:p-6">
        {loading && <p>Loading task efforts...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && taskEfforts.length > 0 && (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="sizingEffort"
                name="Sizing Effort"
                label={{ value: 'Sizing Effort (Story Points)', position: 'bottom', offset: 0 }}
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 1']}
              />
              <YAxis
                type="number"
                dataKey="actualEffort"
                name="Actual Effort (Hours)"
                label={{ value: 'Actual Effort (Hours)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Scatter name="Tasks" data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
        {!loading && !error && taskEfforts.length === 0 && (
          <p>No task data available.</p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Comparing sizing effort with actual hours spent on tasks to identify estimation accuracy
        </div>
      </CardFooter>
    </Card>
  );
};

/**
 * Custom Tooltip Component for the Scatter Chart.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { taskTitle, sizingEffort, actualEffort } = payload[0].payload;
    return (
      <div className="bg-white border rounded-md p-2 shadow-lg">
        <p className="text-sm font-semibold">{taskTitle}</p>
        <p className="text-xs">Sizing Effort: {sizingEffort}</p>
        <p className="text-xs">Actual Effort: {actualEffort} hours</p>
      </div>
    );
  }

  return null;
};

export default TaskEffortChart;
