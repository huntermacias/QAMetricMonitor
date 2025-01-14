"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";

import { Weekdays } from "./_components/Weekdays";
import { Months } from "./_components/Months";
import { ContributionGrid } from "./_components/ContributionGraph";
import ColorLegend from "./_components/ColorLegend";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  CrownIcon,
  Medal,
  Star,
} from "lucide-react";

type Contributor = {
  name: string;
  totalPRs: number;
  avgTimeToMerge: number;
  positiveVotes: number;
  uniqueBranches: number;
  commitsByDate: Record<string, number>;
};

const RankingPage: React.FC = () => {
  // Data state
  const [metrics, setMetrics] = useState<Record<string, Contributor> | null>(
    null
  );
  // Enhanced effect: show confetti for champion for a short time
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/api/ranking");
        setMetrics(response.data);
      } catch (error: unknown) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  // Once data arrives, briefly show confetti
  useEffect(() => {
    if (metrics) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // confetti for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full text-center mx-auto">
        <div className="text-2xl text-gray-200 animate-pulse">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  // Convert metrics to array
  const contributors: Contributor[] = Object.entries(metrics).map(
    ([, data]) => ({
      ...data,
    })
  );

  // Sort top contributors by total PRs
  contributors.sort((a, b) => b.totalPRs - a.totalPRs);

  // Separate top 3 from others
  const topThree = contributors.slice(0, 3);
  const others = contributors.slice(3);

  // Aggregate commits for the entire team
  const aggregatedCommits: Record<string, number> = contributors.reduce(
    (acc:any, contributor) => {
      Object.entries(contributor.commitsByDate).forEach(([date, count]) => {
        acc[date] = (acc[date] || 0) + count;
      });
      return acc;
    },
    {}
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden p-8 bg-secondary/10 border-l">
      {/* Confetti effect for a short duration */}
      {showConfetti && (
        <Confetti
          className="pointer-events-none"
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Top banner / hero for the champion */}
      <section className="relative z-10 mb-16 text-center mt-10">
        <motion.div
          className="inline-block relative p-8 rounded-lg border border-white/20 shadow-2xl bg-primary/10 backdrop-blur-sm"
          initial={{ scale: 0.7, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {topThree.length > 0 && (
            <>
              <CrownIcon className="absolute -top-8 left-[45%] transform -translate-x-1/2 text-yellow-300 w-12 h-12 drop-shadow animate-bounce" />
              <h1 className="text-4xl font-extrabold tracking-wide text-yellow-300 drop-shadow-lg">
                {topThree[0].name.toUpperCase()}
              </h1>
              <p className="mt-2 text-lg font-semibold">
                🏆 Champion Contributor 🏆
              </p>
              <div className="mt-4 flex justify-center gap-6 text-base font-medium drop-shadow">
                <span>Total PRs: {topThree[0].totalPRs}</span>
                <span>Avg. Merge: {topThree[0].avgTimeToMerge} hrs</span>
                <span>Votes: {topThree[0].positiveVotes}</span>
              </div>
            </>
          )}
        </motion.div>
      </section>

      {/* Top 3 Podium Section */}
      <section className="relative mb-16">
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wider underline decoration-wavy decoration-yellow-300">
          🏅 Top Contributors 🏅
        </h2>
        <div className="flex flex-wrap justify-center items-start gap-8">
          {topThree.map((contributor, index) => {
            const colorClass =
              index === 0
                ? "bg-[#FFD700]/20 border-yellow-400"
                : index === 1
                ? "bg-[#C0C0C0]/20 border-gray-300"
                : "bg-[#CD7F32]/20 border-orange-400";
            const Icon =
              index === 0
                ? CrownIcon
                : index === 1
                ? Medal
                : Star;
            return (
              <motion.div
                key={contributor.name}
                className={`w-44 h-44 p-4 rounded-lg border shadow-md hover:scale-105 transform transition-all duration-300 ${colorClass}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                <div className="text-center">
                  <Icon
                    className={`mx-auto ${
                      index === 0 ? "w-10 h-10 text-yellow-300" : "w-8 h-8"
                    }`}
                  />
                  <h3 className="mt-2 text-xl font-bold drop-shadow-sm">
                    {contributor.name}
                  </h3>
                  <p className="text-sm text-gray-200">
                    Total PRs: {contributor.totalPRs}
                  </p>
                </div>
                <div className="mt-4 text-sm space-y-1">
                  <p>Positive Votes: {contributor.positiveVotes}</p>
                  <p>Unique Branches: {contributor.uniqueBranches}</p>
                  {/* <p>Avg Merge Time: {contributor.avgTimeToMerge} hrs</p> */}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contribution Graph */}
      <section className="relative z-0 mb-16">
        <h2 className="text-2xl font-semibold text-center mb-6 underline decoration-dotted">
          📈 Contribution Activity
        </h2>
        <div className="flex justify-center items-start overflow-auto p-8 rounded-lg shadow-2xl bg-white/5 backdrop-blur-sm">
          <Weekdays />
          <div className="relative">
            <Months data={aggregatedCommits} />
            <ContributionGrid data={aggregatedCommits} />
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <ColorLegend />
        </div>
      </section>

      {/* All Contributors Section */}
      <section className="relative">
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wider text-pink-200 underline decoration-slice decoration-pink-400">
          All Contributors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {others.map((contributor) => (
            <motion.div
              key={contributor.name}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="hover:scale-105 transform transition-transform duration-300"
            >
              <Card className="bg-white/10 backdrop-blur border border-white/20 text-gray-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-medium mb-1">
                    {contributor.name.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-300 italic">
                    Contributing Hero
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p>
                    <span className="font-semibold">Total PRs:</span>{" "}
                    {contributor.totalPRs}
                  </p>
                  <p>
                    <span className="font-semibold">Votes:</span>{" "}
                    {contributor.positiveVotes}
                  </p>
                  <p>
                    <span className="font-semibold">Branches:</span>{" "}
                    {contributor.uniqueBranches}
                  </p>
                  <p>
                    <span className="font-semibold">Avg Merge:</span>{" "}
                    {contributor.avgTimeToMerge} hrs
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subtle Animated Background */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#ffffff0a]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </div>
  );
};

export default RankingPage;
