// app/jenkins/JenkinsTeamsPage.tsx
'use client';
import React, { useCallback } from 'react';
import JenkinsTeamsView from './_components/JenkinsTeamsView';
import JenkinsBuildTable from './_components/buildTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCachedFetch } from '@/hooks/useCachedFetch'; 
import { Loader } from 'lucide-react';

export default function JenkinsTeamsPage() {
  // Memoize the fetcher function to prevent it from changing on every render
  const fetchJenkinsData = useCallback(async (): Promise<any[]> => {
    const response = await fetch('/api/jenkins');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data: any = await response.json();
    return data;
  }, []); // Empty dependency array ensures this function is created only once

  // Use the custom hook
  const { data: allBuilds, loading, error, refetch } = useCachedFetch<any[]>({
    key: 'jenkins_builds',
    fetcher: fetchJenkinsData,
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <Loader />
        <span className="ml-2">Loading Jenkins Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 font-bold">
        <p>Error: {error}</p>
        <Button onClick={refetch} className="mt-2 bg-red-500 hover:bg-red-600">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Jenkins Dashboard</h1>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={refetch} className="bg-blue-500 hover:bg-blue-600">
          Refresh Data
        </Button>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="crt-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="crt-data">CRT Data</TabsTrigger>
          <TabsTrigger value="all-builds">All Builds</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* CRT Data Tab */}
        <TabsContent value="crt-data">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>CRT Data by Team</CardTitle>
              <CardDescription>
                View Jenkins build data organized by team. Click on a team to see detailed builds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JenkinsTeamsView builds={allBuilds} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Builds Tab */}
        <TabsContent value="all-builds">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>All Jenkins Builds</CardTitle>
              <CardDescription>
                Comprehensive view of all Jenkins builds across all teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JenkinsBuildTable builds={allBuilds} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          {/* Account Settings Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage settings configs section (RANDOM DATA BELOW)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Pedro Duarte" />
              </div>
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@peduarte" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          {/* Password Settings Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Save Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
