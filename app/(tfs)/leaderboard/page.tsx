'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ContributionGrid } from './_components/ContributionGraph';
import { Weekdays } from './_components/Weekdays';
import { Months } from './_components/Months';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import ColorLegend from './_components/ColorLegend';
import { CrownIcon, Medal, Star, Activity, BarChart3 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
        <div className="text-xl text-gray-500">Loading leaderboard...</div>
      </div>
    );
  }

  const contributors: Contributor[] = Object.entries(metrics).map(([name, data]) => ({
    
    ...data,
  }));

  contributors.sort((a, b) => b.totalPRs - a.totalPRs);

  const topThree = contributors.slice(0, 3);
  const others = contributors.slice(3);

  const aggregatedCommits = contributors.reduce((acc:any, contributor) => {
    Object.entries(contributor.commitsByDate).forEach(([date, count]) => {
      acc[date] = (acc[date] || 0) + count;
    });
    return acc;
  }, {});

  return (
    <div className="relative p-8 min-h-screen w-full overflow-hidden">

      {/* Hero Section */}
      <section className="relative z-10 mb-16 text-center">
        <motion.div
          className="inline-block relative p-8 rounded-lg border shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-extrabold tracking-wide">{topThree[0].name.toUpperCase()}</h1>
          <p className="mt-2 text-lg font-semibold">🏆 Champion Contributor 🏆</p>
          <div className="mt-4 flex justify-center gap-4 text-sm font-medium">
            <span>Total PRs: {topThree[0].totalPRs}</span>
            <span>Avg. Merge Time: {topThree[0].avgTimeToMerge} hrs</span>
            <span>Positive Votes: {topThree[0].positiveVotes}</span>
          </div>
        </motion.div>
      </section>

      {/* Top 3 Podium */}
      <section className="relative z-10 mb-16">
        <h2 className="text-2xl font-bold text-center mb-6">🏅 Top Contributors 🏅</h2>
        <div className="flex justify-center items-center gap-8">
          {topThree.map((contributor, index) => (
            <motion.div
              key={contributor.name}
              className={`w-60 p-4 rounded-lg ${
                index === 0
                  ? 'bg-yellow-500/20'
                  : index === 1
                  ? 'bg-gray-300/20'
                  : 'bg-orange-300/20'
              } shadow-md`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-center">
                {index === 0 && <CrownIcon className="w-10 h-10 text-yellow-300 mx-auto" />}
                {index === 1 && <Medal className="w-8 h-8 text-gray-400 mx-auto" />}
                {index === 2 && <Star className="w-8 h-8 text-orange-500 mx-auto" />}
                <h3 className="mt-2 text-lg font-bold">{contributor.name}</h3>
                <p className="text-sm text-gray-400">Total PRs: {contributor.totalPRs}</p>
              </div>
              <div className="mt-4 text-sm">
                <p>Positive Votes: {contributor.positiveVotes}</p>
                <p>Unique Branches: {contributor.uniqueBranches}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contribution Graph */}
      <section className="relative z-10 mb-16">
        <h2 className="text-2xl font-semibold text-center mb-6">📈 Contribution Activity</h2>
        <div className="flex justify-center items-start overflow-auto p-8 border rounded-lg shadow-lg">
          <Weekdays />
          <div className="relative">
            <Months data={aggregatedCommits} />
            <ContributionGrid data={aggregatedCommits} />
          </div>
        </div>
            {/* Color Legend */}
      <section className="flex justify-center mt-12">
        <ColorLegend />
      </section>
      </section>

      {/* All Contributors */}
      <section className="relative z-10">
        <h2 className="text-2xl font-semibold text-center mb-6">All Contributors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {others.map((contributor) => (
            <Card key={contributor.name} className=" hover:scale-105 transform transition-transform">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{contributor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total PRs: {contributor.totalPRs}</p>
                <p>Positive Votes: {contributor.positiveVotes}</p>
                <p>Avg. Merge Time: {contributor.avgTimeToMerge} hrs</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

  
    </div>
  );
};

export default RankingPage;
