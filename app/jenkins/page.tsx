'use client';
import React, { useEffect, useState } from 'react';
import JenkinsBuildTable from './_components/buildTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


const JenkinsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Jenkins Build Data
      </h1>

      <div className='flex flex-row'>
        <div className="overflow-x-auto col-span-6">
          <JenkinsBuildTable />
        </div>

        <div className='p-2 ml-8 border'>
          <ScrollArea className="h-48 w-64 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">Builds</h4>

              <div className="text-sm flex flex-row gap-8 mb-4">
                Job 1 <Badge>queued...</Badge> 
              </div>
              <div className="text-sm flex flex-row gap-8">
                Job 2 <Badge>complete</Badge> 
              </div>
              <Separator className="my-2" />

            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default JenkinsPage;
