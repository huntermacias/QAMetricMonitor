'use client';
import React from 'react';
import JenkinsBuildTable from './_components/buildTable';

export default function JenkinsPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Jenkins Build Data
      </h1>

      <div className="flex flex-row">
        <div className="overflow-x-auto col-span-6">
          <JenkinsBuildTable />
        </div>
      </div>
    </div>
  );
}
