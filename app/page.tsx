'use client'; 
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null); // State to store the fetched data
  const [error, setError] = useState<string | null>(null); // State to store any error

  useEffect(() => {
    // Fetch data from the API route
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jenkins/route.ts'); // API call to your custom route
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result); // Update state with fetched data
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>; // Render error if any
  }

  if (!data) {
    return <div>Loading...</div>; // Render loading state
  }

  return (
    <div>
      <h1>Jenkins API Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* Pretty print the JSON data */}
    </div>
  );
}
