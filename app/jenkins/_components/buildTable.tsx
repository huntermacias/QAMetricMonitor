"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BuildData } from "@/types/tfs"; // your BuildData interface
import JenkinsTableModal from "./JenkinsTableModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

// ---------------------------------------------------------------------------
// TEAM & JOB MAPPING
// ---------------------------------------------------------------------------
const teamNames: Record<number, string> = {
  1: "Team 1",
  2: "Team 2",
  3: "Team 3",
  4: "Team 4",
  5: "Team 5",
  6: "Team 6",
  7: "Team 7",
  8: "Team 8",
};

const jobToTeams: Record<string, number[]> = {
  "00_Shopping_UI_CRT_Agent_Tests": [6, 7],
  "01_Shopping_UI_CRT_Consumer_Part1": [1, 8],
  "02_Shopping_UI_CRT_Consumer_Part2": [2, 4],
  "03_Shopping_UI_CRT_Consumer_Part3": [3, 5],
  "03_Shopping_API_Service_Hotel_Search": [3, 5],
  "00_Shopping_API_APIConnect_Cruise": [6, 7],
  "00_Shopping_API_Service_Odysseus_Cruise": [2, 4],
  "01_Shopping_API_Service_Derby_Tickets": [1, 8],
};

const allJobs = ["All", ...Object.keys(jobToTeams)];

// Tab definitions
type TabOption = "overview" | "analytics" | "teams" | "details";

// ---------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------
export default function JenkinsDashboard() {
  const [data, setData] = useState<BuildData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabOption>("overview");

  // Modal
  const [selectedBuild, setSelectedBuild] = useState<BuildData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<BuildData[]>([]);

  // Global search
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<BuildData[]>([]);

  // Detailed table filters
  type SortField = "trimmedDisplayName" | "number" | "timestamp" | "userName";
  type SortOrder = "asc" | "desc";
  const [filterJob, setFilterJob] = useState("All");
  const [filterSDET, setFilterSDET] = useState("");
  const [filterBuildNo, setFilterBuildNo] = useState("");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const resp = await fetch("/api/jenkins");
      if (!resp.ok) {
        throw new Error(`Error fetching Jenkins data: ${resp.statusText}`);
      }
      const builds: BuildData[] = await resp.json();
      // Assign teams in UI
      const processed = builds.map((b) => ({
        ...b,
        teams: jobToTeams[b.trimmedDisplayName] || [],
      }));
      setData(processed);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60_000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Rerun build
  const rerunBuild = async (jobName: string) => {
    if (!jobName) return;
    try {
      const resp = await fetch("/api/jenkins/runBuild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobName, parameters: {} }),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Failed to rerun build");
      }
      // refresh
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Modal
  const openModal = (build: BuildData) => {
    setSelectedBuild(build);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedBuild(null);
    setIsModalOpen(false);
  };

  // Toggle favorites
  const toggleFavorite = (build: BuildData) => {
    const key = build.trimmedDisplayName + build.number;
    const isFav = favorites.some((f) => f.trimmedDisplayName + f.number === key);
    setFavorites((prev) =>
      isFav
        ? prev.filter((f) => f.trimmedDisplayName + f.number !== key)
        : [...prev, build]
    );
  };

  // -----------------------------------------------------------------
  // GLOBAL SEARCH LOGIC
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!data) return;
    if (!globalSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const term = globalSearch.toLowerCase();

    // Filter across build name, user name, or build number
    const results = data.filter((b) => {
      const buildNum = b.number.toString();
      const name = b.trimmedDisplayName.toLowerCase();
      const user = b.userName?.toLowerCase() || "";
      return name.includes(term) || user.includes(term) || buildNum === term;
    });
    setSearchResults(results.slice(0, 10)); // top 10
  }, [data, globalSearch]);

  const handleSearchSelect = (build: BuildData) => {
    // For demonstration, let's open the modal
    setSelectedBuild(build);
    setIsModalOpen(true);
    setGlobalSearch("");
    setSearchResults([]);
  };

  // -----------------------------------------------------------------
  // LOADING & ERROR STATES
  // -----------------------------------------------------------------
  if (error) {
    return (
      <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-red-800/10 p-6 rounded shadow border border-red-600/20">
          <p className="text-red-400 font-semibold">Error: {error}</p>
          <Button onClick={() => fetchData()} className="mt-4 bg-blue-600 text-white">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400">Loading Jenkins data...</div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors relative">
      {isModalOpen && selectedBuild && (
        <JenkinsTableModal
          selectedBuild={selectedBuild}
          closeModal={closeModal}
          rerunBuild={rerunBuild}
        />
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        searchResults={searchResults}
        onSelectSearchResult={handleSearchSelect}
      />

      <main className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <OverviewTab
                data={data}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                openModal={openModal}
                rerunBuild={rerunBuild}
              />
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AnalyticsTab data={data} />
            </motion.div>
          )}
          {activeTab === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TeamsTab data={data} openModal={openModal} rerunBuild={rerunBuild} />
            </motion.div>
          )}
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <DetailedTableTab
                data={data}
                filterJob={filterJob}
                setFilterJob={setFilterJob}
                filterSDET={filterSDET}
                setFilterSDET={setFilterSDET}
                filterBuildNo={filterBuildNo}
                setFilterBuildNo={setFilterBuildNo}
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                openModal={openModal}
                rerunBuild={rerunBuild}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------
// HEADER with Tabs, Global Search & Search Dropdown
// ---------------------------------------------------------------------
function Header({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  searchResults,
  onSelectSearchResult,
}: {
  activeTab: TabOption;
  setActiveTab: (t: TabOption) => void;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  searchResults: BuildData[];
  onSelectSearchResult: (build: BuildData) => void;
}) {
  return (
    <header className="border-b p-3 flex items-center justify-between space-x-6 dark:border-gray-700 transition-colors relative">
      <nav className="space-x-4 flex-1">
        <TabButton
          label="Overview"
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <TabButton
          label="Analytics"
          active={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
        />
        <TabButton
          label="Teams"
          active={activeTab === "teams"}
          onClick={() => setActiveTab("teams")}
        />
        <TabButton
          label="Detailed Table"
          active={activeTab === "details"}
          onClick={() => setActiveTab("details")}
        />
      </nav>

      {/* global search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search builds, user, build#..."
          className="border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none w-64"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-700 border dark:border-gray-600 shadow z-10 max-h-64 overflow-auto">
            {searchResults.map((r) => (
              <div
                key={`${r.trimmedDisplayName}-${r.number}`}
                className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => onSelectSearchResult(r)}
              >
                <p className="text-sm font-medium dark:text-gray-100">
                  {r.trimmedDisplayName} #{r.number}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {r.userName || "No user"} / {new Date(r.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
        {globalSearch.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-700 border dark:border-gray-600 shadow z-10 max-h-64 p-3 text-sm text-gray-400">
            No matches.
          </div>
        )}
      </div>
    </header>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`pb-2 border-b-2 ${
        active
          ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold"
          : "border-transparent hover:text-blue-400"
      } transition`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------
// OVERVIEW TAB
// ---------------------------------------------------------------------
function OverviewTab({
  data,
  favorites,
  toggleFavorite,
  openModal,
  rerunBuild,
}: {
  data: BuildData[];
  favorites: BuildData[];
  toggleFavorite: (b: BuildData) => void;
  openModal: (b: BuildData) => void;
  rerunBuild: (jobName: string) => void;
}) {
  // Basic stats
  const totalBuilds = data.length;
  const totalPassed = data.filter((b) => b.result === "SUCCESS").length;
  const totalFailed = data.filter((b) => b.result === "FAILURE").length;
  // const totalBuilding = data.filter((b) => b.result === "BUILDING").length;
  const lastFive = [...data].slice(-5).reverse();

  return (
    <div className="flex space-x-6">
      <div className="flex-1 space-y-6">
        {/* Stats row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Builds" value={totalBuilds} />
          <StatCard label="Passed" value={totalPassed} color="text-green-500" />
          <StatCard label="Failed" value={totalFailed} color="text-red-500" />
          {/* <StatCard label="Building" value={totalBuilding} color="text-yellow-500" /> */}
        </section>

        {/* Last 5 builds */}
        <section className="p-4 border rounded shadow dark:border-gray-700 ">
          <h3 className="text-lg font-semibold mb-2">Recent Builds</h3>
          <div className="space-y-2">
            {lastFive.map((b) => (
              <OverviewBuildRow
                key={b.number + b.trimmedDisplayName}
                build={b}
                openModal={openModal}
                rerunBuild={rerunBuild}
                toggleFavorite={toggleFavorite}
                isFavorite={favorites.some(
                  (f) =>
                    f.number === b.number && f.trimmedDisplayName === b.trimmedDisplayName
                )}
              />
            ))}
          </div>
        </section>

        {/* Quick Rerun */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Quick Rerun</h3>
          <div className="flex space-x-2">
            <Button onClick={() => rerunBuild("01_Shopping_UI_CRT_Consumer_Part1")}>
              Consumer P1
            </Button>
            <Button onClick={() => rerunBuild("02_Shopping_UI_CRT_Consumer_Part2")}>
              Consumer P2
            </Button>
          </div>
        </section>
      </div>

      {/* Right side: pinned/favorites */}
      <aside className="w-64 border-l p-4 space-y-2 hidden sm:block dark:border-gray-700">
        <h3 className="font-semibold mb-2">Pinned Builds</h3>
        {favorites.length === 0 ? (
          <p className="text-sm text-gray-400">No favorites yet.</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((b) => (
              <div
                key={b.number + b.trimmedDisplayName}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition cursor-pointer"
                onClick={() => openModal(b)}
              >
                <div>
                  <p className="text-sm font-medium">
                    {b.trimmedDisplayName} #{b.number}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(b.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="text-red-500 text-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(b);
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-black dark:text-gray-50",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="p-4 border rounded shadow hover:shadow-lg transition cursor-pointer dark:border-gray-700">
      <p className="text-xs uppercase font-semibold text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function OverviewBuildRow({
  build,
  openModal,
  rerunBuild,
  toggleFavorite,
  isFavorite,
}: {
  build: BuildData;
  openModal: (b: BuildData) => void;
  rerunBuild: (job: string) => void;
  toggleFavorite: (b: BuildData) => void;
  isFavorite: boolean;
}) {
  const statusClass =
    build.result === "SUCCESS"
      ? "bg-green-200 text-green-800"
      : build.result === "FAILURE"
      ? "bg-red-200 text-red-800"
      // : build.result === "BUILDING"
      // ? "bg-yellow-200 text-yellow-800"
      : "bg-gray-200 text-gray-800";

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition rounded">
      <div onClick={() => openModal(build)} className="flex-1 cursor-pointer">
        <p className="font-medium">
          {build.trimmedDisplayName} #{build.number}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(build.timestamp).toLocaleString()}
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded ${statusClass} mx-2`}>
        {build.result}
      </span>
      <button
        className="text-yellow-500 text-xl"
        onClick={() => toggleFavorite(build)}
        title={isFavorite ? "Unpin" : "Pin this build"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
      <Button
        className="ml-2 bg-blue-500 hover:bg-blue-600 text-xs text-white"
        onClick={() => rerunBuild(build.trimmedDisplayName)}
      >
        Rerun
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------
// ANALYTICS TAB
// ---------------------------------------------------------------------
function AnalyticsTab({ data }: { data: BuildData[] }) {
  // We do daily grouping & compute day-over-day changes in pass/fail
  // Then show multiple toggles for pie, line, stacked, etc.

  const allJobNames = useMemo(() => {
    const set = new Set<string>(data.map((d) => d.trimmedDisplayName));
    return Array.from(set).sort();
  }, [data]);

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("7");
  const [showPie, setShowPie] = useState(true);
  const [showLine, setShowLine] = useState(true);
  const [showDuration, setShowDuration] = useState(false);
  const [showStacked, setShowStacked] = useState(false);
  const [showPercentChange, setShowPercentChange] = useState(true);

  // Filter by time & job
  const filteredData = useMemo(() => {
    if (!data.length) return [];

    // last X days
    const maxTimestamp = Math.max(...data.map((d) => d.timestamp));
    const rangeDays = parseInt(timeRange, 10);
    const minTimestamp = maxTimestamp - rangeDays * 24 * 60 * 60 * 1000;

    let arr = data.filter((b) => b.timestamp >= minTimestamp);
    if (selectedJobs.length > 0) {
      arr = arr.filter((b) => selectedJobs.includes(b.trimmedDisplayName));
    }
    return arr.sort((a, b) => a.timestamp - b.timestamp);
  }, [data, timeRange, selectedJobs]);

  // Summaries for the pie
  const totalBuilds = filteredData.length;
  const totalPassed = filteredData.filter((b) => b.result === "SUCCESS").length;
  const totalFailed = filteredData.filter((b) => b.result === "FAILURE").length;
  // const totalBuilding = filteredData.filter((b) => b.result === "BUILDING").length;
  const totalOther = totalBuilds - (totalPassed + totalFailed );

  const pieData = [
    { name: "Passed", value: totalPassed },
    { name: "Failed", value: totalFailed },
    // { name: "Building", value: totalBuilding },
    { name: "Other", value: totalOther },
  ];

  // Group by date for line data
  const dayGroupedData = useMemo(() => {
    // create a map of date-> aggregated pass/fail/duration
    const map: Record<string, { date: string; pass: number; fail: number; builds: number; durationSum: number }> =
      {};
    for (const b of filteredData) {
      const dateStr = new Date(b.timestamp).toLocaleDateString();
      if (!map[dateStr]) {
        map[dateStr] = {
          date: dateStr,
          pass: 0,
          fail: 0,
          builds: 0,
          durationSum: 0,
        };
      }
      const passCount = b.totalCount - b.failCount - b.skipCount;
      map[dateStr].pass += passCount;
      map[dateStr].fail += b.failCount;
      map[dateStr].durationSum += b.duration;
      map[dateStr].builds += 1;
    }

    // convert map to array sorted by date
    const arr = Object.values(map).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // compute daily % changes if showPercentChange
    if (showPercentChange) {
      for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1];
        const curr = arr[i];
        // day-over-day pass/fail
        const failDelta = curr.fail - prev.fail;
        const passDelta = curr.pass - prev.pass;
        const failPctChange = prev.fail === 0 ? 0 : (failDelta / prev.fail) * 100;
        const passPctChange = prev.pass === 0 ? 0 : (passDelta / prev.pass) * 100;
        // store them
        (curr as any).failPctChange = Math.round(failPctChange);
        (curr as any).passPctChange = Math.round(passPctChange);
      }
    }

    return arr;
  }, [filteredData, showPercentChange]);

  // We transform dayGroupedData into the line chart shape
  const lineData = dayGroupedData.map((d) => ({
    date: d.date,
    fail: d.fail,
    pass: d.pass,
    duration: Math.round(d.durationSum / 1000 / 60), // total minutes aggregated
  }));

  // For stacked bar, just take the last 10 days
  const barData = lineData.slice(-10).map((d, i) => ({
    name: d.date,
    fail: d.fail,
    pass: d.pass,
    skip: 0, // we could store skip if we want daily skip data
  }));

  // Toggles for multi job
  const allJobList = useMemo(() => Array.from(new Set(data.map((b) => b.trimmedDisplayName))), [
    data,
  ]);
  const toggleJob = (job: string) => {
    setSelectedJobs((prev) =>
      prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job]
    );
  };

  // Render
  return (
    <div className="space-y-6 dark:text-gray-100">
      {/* Filters */}
      <section className="p-4 border rounded shadow dark:border-gray-700 space-y-3">
        <h3 className="font-semibold text-lg">Analytics Filters</h3>
        <div className="flex flex-wrap gap-4">
          {/* Time Range */}
          <div>
            <label className="block text-sm mb-1">Time Range (Days)</label>
            <Select onValueChange={setTimeRange} value={timeRange}>
              <SelectTrigger className="border w-32 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectValue placeholder="7" />
              </SelectTrigger>
              <SelectContent className="border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectGroup>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Multi-job selection */}
          <div>
            <label className="block text-sm mb-1">Jobs</label>
            <div className="border rounded p-2 space-y-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              {allJobList.map((job) => {
                const isChecked = selectedJobs.includes(job);
                return (
                  <label key={job} className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleJob(job)}
                    />
                    <span>{job}</span>
                  </label>
                );
              })}
              {allJobList.length === 0 && (
                <p className="text-xs text-gray-400">No jobs found in data.</p>
              )}
            </div>
          </div>

          {/* Show % changes */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Show % Changes</label>
            <input
              type="checkbox"
              checked={showPercentChange}
              onChange={(e) => setShowPercentChange(e.target.checked)}
            />
          </div>
        </div>
      </section>

      {/* Toggles for charts */}
      <section className="flex flex-wrap gap-2">
        <Button variant={showPie ? "default" : "secondary"} onClick={() => setShowPie(!showPie)}>
          Pass/Fail Pie
        </Button>
        <Button variant={showLine ? "default" : "secondary"} onClick={() => setShowLine(!showLine)}>
          Pass/Fail Trend
        </Button>
        <Button
          variant={showDuration ? "default" : "secondary"}
          onClick={() => setShowDuration(!showDuration)}
        >
          Duration
        </Button>
        <Button variant={showStacked ? "default" : "secondary"} onClick={() => setShowStacked(!showStacked)}>
          Stacked Bar
        </Button>
      </section>

      {/* Summary Stats */}
      <section className="border rounded shadow p-4 dark:border-gray-700">
        <h3 className="font-semibold mb-2">Filtered Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Builds" value={totalBuilds} color="text-blue-400" />
          <StatCard label="Passed" value={totalPassed} color="text-green-400" />
          <StatCard label="Failed" value={totalFailed} color="text-red-400" />
          {/* <StatCard label="Building" value={totalBuilding} color="text-yellow-400" /> */}
        </div>
      </section>

      {/* CHARTS */}
      <div className="space-y-6">
        {/* PIE */}
        {showPie && (
          <section className="p-4 border rounded shadow dark:border-gray-700">
            <h3 className="font-semibold mb-2">Pass/Fail/Other</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    <Cell fill="#86efac" />
                    <Cell fill="#fda4af" />
                    <Cell fill="#fde047" />
                    <Cell fill="#9ca3af" />
                  </Pie>
                  <RechartTooltip
                    contentStyle={{ backgroundColor: "#1f2937" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* LINE: pass/fail day grouping */}
        {showLine && (
          <section className="p-4 border rounded shadow dark:border-gray-700">
            <h3 className="font-semibold mb-2">Pass/Fail by Day</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <RechartTooltip
                    contentStyle={{ backgroundColor: "#1f2937" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fail"
                    stroke="#f87171"
                    strokeWidth={2}
                    name="Failures"
                  />
                  <Line
                    type="monotone"
                    dataKey="pass"
                    stroke="#4ade80"
                    strokeWidth={2}
                    name="Passes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* LINE: Duration day grouping */}
        {showDuration && (
          <section className="p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold mb-2">Build Duration by Day (Total Minutes)</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="date" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <RechartTooltip
                    contentStyle={{ backgroundColor: "#1f2937" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="#a5b4fc"
                    strokeWidth={2}
                    name="Duration (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Stacked Bar (Last 10 days) */}
        {showStacked && (
          <section className="p-4 border rounded shadow dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold mb-2">Pass/Fail Stacked (Last 10 Days in Range)</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <RechartTooltip
                    contentStyle={{ backgroundColor: "#1f2937" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="pass" stackId="a" fill="#86efac" name="Pass" />
                  <Bar dataKey="fail" stackId="a" fill="#fda4af" name="Fail" />
                  <Bar dataKey="skip" stackId="a" fill="#9ca3af" name="Skip" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// TEAMS TAB
// ---------------------------------------------------------------------
function TeamsTab({
  data,
  openModal,
  rerunBuild,
}: {
  data: BuildData[];
  openModal: (b: BuildData) => void;
  rerunBuild: (job: string) => void;
}) {
  // We'll do a mock "drag-and-drop" approach with columns for statuses
  const statusColumns = ["SUCCESS", "FAILURE", "OTHER"];
  const buildMap = useMemo(() => {
    const map: Record<string, BuildData[]> = {
      SUCCESS: [],
      FAILURE: [],
      // BUILDING: [],
      OTHER: [],
    };
    data.forEach((b) => {
      if (b.result === "SUCCESS") map.SUCCESS.push(b);
      else if (b.result === "FAILURE") map.FAILURE.push(b);
      // else if (b.result === "BUILDING") map.BUILDING.push(b);
      else map.OTHER.push(b);
    });
    return map;
  }, [data]);

  return (
    <div className="">
      <div className="flex space-x-4">
        {statusColumns.map((col) => {
          const builds = buildMap[col];
          return (
            <div
              key={col}
              className="dark:border-gray-700 dark:bg-gray-800 w-full min-w-[16rem] p-2 border rounded shadow flex flex-col"
            >
              <h3 className="font-semibold mb-2 text-sm uppercase">{col}</h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {builds.map((b) => (
                  <div
                    key={b.number + b.trimmedDisplayName}
                    className="p-2 border rounded hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition cursor-pointer"
                    onClick={() => openModal(b)}
                  >
                    <p className="text-sm font-medium">{b.trimmedDisplayName}</p>
                    <p className="text-xs text-gray-500">#{b.number}</p>
                    <p className="text-xs text-gray-400">
                      {b.userName || "No user"}
                    </p>
                    <div className="mt-1 text-right">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-xs text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          rerunBuild(b.trimmedDisplayName);
                        }}
                      >
                        Rerun
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// DETAILED TABLE TAB
// ---------------------------------------------------------------------
function DetailedTableTab({
  data,
  filterJob,
  setFilterJob,
  filterSDET,
  setFilterSDET,
  filterBuildNo,
  setFilterBuildNo,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  selectedRows,
  setSelectedRows,
  openModal,
  rerunBuild,
}: {
  data: BuildData[];
  filterJob: string;
  setFilterJob: (v: string) => void;
  filterSDET: string;
  setFilterSDET: (v: string) => void;
  filterBuildNo: string;
  setFilterBuildNo: (v: string) => void;
  sortField: "trimmedDisplayName" | "number" | "timestamp" | "userName";
  setSortField: (v: any) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: any) => void;
  selectedRows: Set<string>;
  setSelectedRows: (s: Set<string>) => void;
  openModal: (b: BuildData) => void;
  rerunBuild: (jobName: string) => void;
}) {
  // Filter & sort
  const filtered = useMemo(() => {
    let arr = [...data];
    if (filterJob !== "All") {
      arr = arr.filter((b) => b.trimmedDisplayName === filterJob);
    }
    if (filterSDET.trim()) {
      arr = arr.filter((b) =>
        b.userName?.toLowerCase().includes(filterSDET.toLowerCase())
      );
    }
    if (filterBuildNo.trim()) {
      const n = parseInt(filterBuildNo, 10);
      if (!isNaN(n)) {
        arr = arr.filter((b) => b.number === n);
      }
    }
    arr.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";
      switch (sortField) {
        case "trimmedDisplayName":
          valA = a.trimmedDisplayName.toLowerCase();
          valB = b.trimmedDisplayName.toLowerCase();
          break;
        case "number":
          valA = a.number;
          valB = b.number;
          break;
        case "timestamp":
          valA = a.timestamp;
          valB = b.timestamp;
          break;
        case "userName":
          valA = a.userName?.toLowerCase() || "";
          valB = b.userName?.toLowerCase() || "";
          break;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, filterJob, filterSDET, filterBuildNo, sortField, sortOrder]);

  // Check row
  const handleSelectRow = (build: BuildData) => {
    const key = build.trimmedDisplayName + build.number;
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filtered.length) {
      setSelectedRows(new Set());
    } else {
      const newSet = new Set<string>();
      filtered.forEach((b) => {
        newSet.add(b.trimmedDisplayName + b.number);
      });
      setSelectedRows(newSet);
    }
  };

  const handleBulkRerun = () => {
    if (selectedRows.size === 0) return;
    filtered.forEach((b) => {
      if (selectedRows.has(b.trimmedDisplayName + b.number)) {
        rerunBuild(b.trimmedDisplayName);
      }
    });
  };

  return (
    <div className="space-y-4 dark:text-gray-100">
      {/* Filter area */}
      <div className="p-4 border rounded shadow space-y-2 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="font-semibold">Filters & Sorting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Job */}
          <div>
            <label className="block text-sm mb-1">Job</label>
            <Select onValueChange={setFilterJob} value={filterJob}>
              <SelectTrigger className="border w-full rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectGroup>
                  {allJobs.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* SDET */}
          <div>
            <label className="block text-sm mb-1">SDET</label>
            <input
              type="text"
              className="border w-full rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={filterSDET}
              onChange={(e) => setFilterSDET(e.target.value)}
              placeholder="john.doe"
            />
          </div>
          {/* Build # */}
          <div>
            <label className="block text-sm mb-1">Build #</label>
            <input
              type="number"
              className="border w-full rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={filterBuildNo}
              onChange={(e) => setFilterBuildNo(e.target.value)}
              placeholder="123"
            />
          </div>
          {/* Sort Field */}
          <div>
            <label className="block text-sm mb-1">Sort By</label>
            <Select
              onValueChange={(val) => setSortField(val as any)}
              value={sortField}
            >
              <SelectTrigger className="border w-full rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectValue placeholder="timestamp" />
              </SelectTrigger>
              <SelectContent className="border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectGroup>
                  <SelectItem value="trimmedDisplayName">Job Name</SelectItem>
                  <SelectItem value="number">Build #</SelectItem>
                  <SelectItem value="timestamp">Timestamp</SelectItem>
                  <SelectItem value="userName">SDET</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Sort Order */}
          <div>
            <label className="block text-sm mb-1">Order</label>
            <Select
              onValueChange={(val) => setSortOrder(val as any)}
              value={sortOrder}
            >
              <SelectTrigger className="border w-full rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectValue placeholder="desc" />
              </SelectTrigger>
              <SelectContent className="border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                <SelectGroup>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      {selectedRows.size > 0 && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/40 border rounded shadow flex items-center justify-between dark:border-blue-700 transition-colors">
          <p className="text-sm text-blue-600 dark:text-blue-300">
            {selectedRows.size} builds selected
          </p>
          <Button
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleBulkRerun}
          >
            Rerun Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto border rounded shadow dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
            <tr>
              <th className="px-3 py-2 text-left w-8">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.size === filtered.length && filtered.length > 0}
                />
              </th>
              <TableHeader
                label="Build Name"
                currentField={sortField}
                thisField="trimmedDisplayName"
                sortOrder={sortOrder}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
              />
              <TableHeader
                label="#"
                currentField={sortField}
                thisField="number"
                sortOrder={sortOrder}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
              />
              <TableHeader
                label="Result"
                currentField={sortField}
                thisField="timestamp"
                sortOrder={sortOrder}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
              />
              <TableHeader
                label="SDET"
                currentField={sortField}
                thisField="userName"
                sortOrder={sortOrder}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
              />
              <th className="px-3 py-2 text-left">Failed</th>
              <th className="px-3 py-2 text-left">Skipped</th>
              <th className="px-3 py-2 text-left">Pass</th>
              <th className="px-3 py-2 text-left w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="dark:bg-gray-800 dark:text-gray-200 transition-colors">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No builds found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const passCount = b.calculatedPassCount
                  ? b.calculatedPassCount
                  : b.totalCount - b.failCount - b.skipCount;
                const key = b.trimmedDisplayName + b.number;
                return (
                  <tr
                    key={key}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(key)}
                        onChange={() => handleSelectRow(b)}
                      />
                    </td>
                    <td className="px-3 py-2">{b.trimmedDisplayName}</td>
                    <td className="px-3 py-2">{b.number}</td>
                    <td className="px-3 py-2">{b.result}</td>
                    <td className="px-3 py-2">{b.userName || "N/A"}</td>
                    <td className="px-3 py-2">{b.failCount}</td>
                    <td className="px-3 py-2">{b.skipCount}</td>
                    <td className="px-3 py-2">{passCount}</td>
                    <td className="px-3 py-2">
                      <div className="flex space-x-2">
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-xs text-white"
                          onClick={() => openModal(b)}
                        >
                          Details
                        </Button>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-xs text-white"
                          onClick={() => rerunBuild(b.trimmedDisplayName)}
                        >
                          Rerun
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function handleSelectAll(
  e: React.ChangeEvent<HTMLInputElement>,
  // We need reference to builds in scope, but we’ll do it in component
) {}

function TableHeader({
  label,
  currentField,
  thisField,
  sortOrder,
  setSortField,
  setSortOrder,
}: {
  label: string;
  currentField: string;
  thisField: string;
  sortOrder: "asc" | "desc";
  setSortField: (f: string) => void;
  setSortOrder: (o: "asc" | "desc") => void;
}) {
  const isActive = currentField === thisField;
  const handleClick = () => {
    if (isActive) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(thisField);
      setSortOrder("asc");
    }
  };
  return (
    <th
      onClick={handleClick}
      className="cursor-pointer select-none px-3 py-2 text-left hover:text-blue-500"
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {isActive && (
          <span className="text-xs text-blue-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
        )}
      </div>
    </th>
  );
}
