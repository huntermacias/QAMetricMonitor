'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Weekdays } from './_components/Weekdays';
import { Months } from './_components/Months';
import { ContributionGrid } from './_components/ContributionGraph';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ColorLegend from './_components/ColorLegend';
import { CrownIcon } from 'lucide-react';

type Contributor = {
  name: string;
  totalPRs: number;
  avgTimeToMerge: number;
  positiveVotes: number;
  uniqueBranches: number;
  commitsByDate: Record<string, number>;
};

const RankingPage = () => {
  const [metrics, setMetrics] = useState<Record<string, Contributor> | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/ranking');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const contributors: Contributor[] = Object.entries(metrics).map(
    ([name, data]: [string, any]) => ({
      name,
      ...data,
    })
  );

  // Sort contributors by total PRs in descending order
  contributors.sort((a, b) => b.totalPRs - a.totalPRs);

  const topContributor = contributors[0];

  // Aggregate contributions across all contributors
  const aggregatedCommits: Record<string, number> = contributors.reduce(
    (acc: Record<string, number>, contributor) => {
      Object.entries(contributor.commitsByDate).forEach(([date, count]) => {
        acc[date] = (acc[date] || 0) + count;
      });
      return acc;
    },
    {}
  );
  

  return (
    <div className="p-8 min-h-screen w-full">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold">Contributors Ranking</h1>
        <p className="mt-2 text-lg text-gray-600">See who’s leading the way in contributions!</p>
      </header>

      {/* Top Contributor */}
      <section className="mb-12 flex justify-center">
        <Card className="w-full max-w-md bg-slate-500/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex items-center space-x-4">
            <CrownIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <CardTitle className="text-2xl font-bold">{topContributor.name.toUpperCase()}</CardTitle>
              <CardDescription className="text-sm text-gray-500">Top Contributor</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Total PRs:</span> {topContributor.totalPRs}
              </p>
              <p>
                <span className="font-semibold">Positive Votes:</span> {topContributor.positiveVotes}
              </p>
              <p>
                <span className="font-semibold">Unique Branches:</span> {topContributor.uniqueBranches}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contributors Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">All Contributors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {contributors.map((contributor) => (
            <Card
              key={contributor.name}
              className="hover:bg-white/5 transition-colors duration-200"
            >
              <CardHeader>
                <CardTitle className="text-lg font-medium">{contributor.name.toUpperCase()}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Total PRs: {contributor.totalPRs}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1 mt-2">
                <p>
                  <span className="font-semibold">Positive Votes:</span> {contributor.positiveVotes}
                </p>
                <p>
                  <span className="font-semibold">Unique Branches:</span> {contributor.uniqueBranches}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contribution Graph */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Pull Request Activity</h2>
        <div className="flex justify-center items-start overflow-auto p-8 border rounded-lg shadow">
          <Weekdays />
          <div className="relative">
            <Months data={aggregatedCommits} />
            <ContributionGrid data={aggregatedCommits} />
          </div>
        </div>
      </section>

      {/* Color Legend */}
      <section className="flex justify-center">
        <ColorLegend />
      </section>
    </div>
  );
};

export default RankingPage;
