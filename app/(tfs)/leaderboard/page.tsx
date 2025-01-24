"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";

import { Weekdays } from "./_components/Weekdays";
import { Months } from "./_components/Months";
import { ContributionGrid } from "./_components/ContributionGraph";
import ColorLegend from "./_components/ColorLegend";

import { CrownIcon, Medal, Star } from "lucide-react";

// ---------- TYPES ----------
type Contributor = {
  name: string;
  totalPRs: number;
  avgTimeToMerge: number;
  positiveVotes: number;
  uniqueBranches: number;
  commitsByDate: Record<string, number>;
};

const RankingPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, Contributor> | null>(
    null
  );
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

  // Separate top 3 from others & filter out all contributors with 0 PRs
  const topThree = contributors.slice(0, 4); // champion + top 3
  const others = contributors.slice(3).filter((c) => c.totalPRs > 0);
 

  // Aggregate commits for the entire team
  const aggregatedCommits: Record<string, number> = contributors.reduce(
    (acc: any, contributor) => {
      Object.entries(contributor.commitsByDate).forEach(([date, count]) => {
        acc[date] = (acc[date] || 0) + count;
      });
      return acc;
    },
    {}
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden p-8 bg-secondary/10 border-l">
      {/* Confetti Celebration */}
      {showConfetti && (
        <Confetti
          className="pointer-events-none"
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* 1) Champion Banner */}
      {topThree.length > 0 && (
        <section className="relative z-10 mb-16 text-center mt-10">
          <motion.div
            className="inline-block relative p-8 rounded-lg border border-white/20 shadow-2xl bg-primary/10 backdrop-blur-sm"
            initial={{ scale: 0.7, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <CrownIcon className="absolute -top-8 left-[45%] transform -translate-x-1/2 text-yellow-300 w-12 h-12 drop-shadow animate-bounce" />
            <h1 className="text-4xl font-extrabold tracking-wide text-yellow-300 drop-shadow-lg">
              {topThree[0].name.replace(/c_|PACIFIC\\?/g, "").toUpperCase()}
            </h1>
            <p className="mt-2 text-lg font-semibold">
              <span role="img" aria-label="trophy">
                🏆
              </span>{" "}
              Champion Contributor{" "}
              <span role="img" aria-label="trophy">
                🏆
              </span>
            </p>
            <div className="mt-4 flex justify-center gap-6 text-base font-medium drop-shadow">
              <span>Total PRs: {topThree[0].totalPRs}</span>
            </div>
          </motion.div>
        </section>
      )}

      {/* 2) Podium for the Next Top 3 */}
      <section className="relative mb-16">
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wider underline decoration-wavy decoration-yellow-300">
          <span role="img" aria-label="medal">
            🏅
          </span>{" "}
          Top Contributors{" "}
          <span role="img" aria-label="medal">
            🏅
          </span>
        </h2>

        <div className="flex flex-wrap justify-center items-start gap-8">
          {topThree.slice(1, 4).map((contributor, index) => {
            const colorClass =
              index === 0
                ? "bg-[#FFD700]/20 border-yellow-400"
                : index === 1
                ? "bg-[#C0C0C0]/20 border-gray-300"
                : "bg-[#CD7F32]/20 border-brown-400";
            const Icon = index === 0 ? CrownIcon : index === 1 ? Medal : Star;
            return (
              <motion.div
                key={contributor.name}
                className={`w-64 h-44 p-4 rounded-lg border shadow-md hover:scale-105 transform transition-all duration-300 ${colorClass}`}
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
                    {contributor.name.replace(/c_|PACIFIC\\?/g, "")}
                  </h3>
                  <p className="text-sm text-gray-200">
                    Total PRs: {contributor.totalPRs}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3) Contribution Graph */}
      <section className="relative z-0 mb-16">
        <h2 className="text-2xl font-semibold text-center mb-6 underline decoration-dotted">
          <span role="img" aria-label="chart">
            📈
          </span>{" "}
          Contribution Activity
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

      {/* 4) All Contributors - Advanced Table Layout */}
      <section className="relative">
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wider text-pink-200 underline decoration-slice decoration-pink-400">
          All Contributors
        </h2>

        <div className="overflow-x-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl p-4">
          <table className="w-full table-auto text-left text-sm">
            <thead className="bg-white/10 text-gray-200">
              <tr>
                <th className="p-3 uppercase tracking-widest font-semibold">
                  Name
                </th>
                <th className="p-3 uppercase tracking-widest font-semibold">
                  Total PRs
                </th>
                <th className="p-3 uppercase tracking-widest font-semibold">
                  Avg Time to Merge
                </th>
                <th className="p-3 uppercase tracking-widest font-semibold">
                  Positive Votes
                </th>
                <th className="p-3 uppercase tracking-widest font-semibold">
                  Unique Branches
                </th>
              </tr>
            </thead>
            <tbody>
              {others.map((contributor) => (
                <motion.tr
                  key={contributor.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="hover:bg-white/10 transition-colors duration-200"
                >
                  <td className="p-3 font-semibold">
                    {contributor.name.replace(/c_|PACIFIC\\?/g, "")}
                  </td>
                  <td className="p-3">{contributor.totalPRs}</td>
                  <td className="p-3">{contributor.avgTimeToMerge} hrs</td>
                  <td className="p-3">{contributor.positiveVotes}</td>
                  <td className="p-3">{contributor.uniqueBranches}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5) Subtle Animated Background */}
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
