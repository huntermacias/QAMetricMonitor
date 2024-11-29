'use client';
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
}

const JenkinsPage: React.FC = () => {
  const [data, setData] = useState<BuildData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jenkins');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Jenkins Build Data</h1>
      {data.map((build) => (
        <div key={build.number}>
          <h2>{build.trimmedDisplayName}</h2>
          <p>Build Number: {build.number}</p>
          <p>Result: {build.result}</p>
          <p>User: {build.userName || 'N/A'}</p>
          <p>Total Tests: {build.totalCount}</p>
          <p>Failed Tests: {build.failCount}</p>
          <p>Skipped Tests: {build.skipCount}</p>
          <p>Timestamp: {new Date(build.timestamp).toLocaleString()}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default JenkinsPage;
