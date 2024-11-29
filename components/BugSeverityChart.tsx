// components/BugSeverityChart.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BugSeverityChart: React.FC = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeverityData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/bug-severity-priority');
        if (!response.ok) {
          throw new Error('Failed to fetch severity data');
        }
        const result = await response.json();
        const severityData = Object.entries(result.severityDistribution).map(
          ([key, value]) => ({
            name: key,
            value: value as number,
          })
        );
        setData(severityData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeverityData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bug Severity Distribution</CardTitle>
        <CardDescription>Distribution of bugs by severity level</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && data.length > 0 && (
          <PieChart width={400} height={300}>
            <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </CardContent>
    </Card>
  );
};

export default BugSeverityChart;
