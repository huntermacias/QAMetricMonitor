/*
* TODOS: 
    1. state management: use library like zustand or redux toolkit
    2. Look into graphQL for flexible querying/mutations and adding web sockets for real-time updates
    3. Split file into DataTable, FilterPanel, SidePanel, and AnalyticsChart components
*/
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import debounce from "lodash.debounce";
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@radix-ui/react-separator";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Move,
  Eye,
  CheckSquare,
  Square,
  FileDown,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import Loading from "@/components/Loading";
import Pagination from "./_components/Pagination";
import CustomFilter from "./_components/Filter";
import AnalyticsPanel from "./_components/AnalyticsPanel";
import SidePanel from "./_components/SidePanel";
import { mapState, mapWorkItemType } from "./utils/mappers";

// ------------------- Types -------------------
interface TFSWorkItem {
  id: number;
  url: string;
  system: {
    Title: string;
    WorkItemType: string;
    State: string;
    Reason: string;
    AuthorizedAs: string;
    tags: string;
    CreatedDate: string;
    IterationPath?: string;
  };
  costcoTravel: {
    Team: string;
  };
  parsedTags: string[];
  systemDescription?: string;
  relations?: any[];
};


interface GroupedRecord {
  groupKey: string; // e.g. a State or Team name
  items: TFSWorkItem[];
};

// Distinguishes possible table states
type GroupBy = "none" | "state" | "team";

// Sorting
type SortKey =
  | "id"
  | "title"
  | "workItemType"
  | "state"
  | "AuthorizedAs"
  | "team"
  | "sprint";

interface SortConfig {
  key: SortKey;
  direction: "ascending" | "descending";
}

// Column config
interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  pinned?: boolean;
}




// Simple text highlighting
function highlightMatch(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-yellow-200 text-black">
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
}

export default function TFSPage() {
  // ------------- Data States -------------
  const [data, setData] = useState<TFSWorkItem[]>([]);
  const [filteredData, setFilteredData] = useState<TFSWorkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ------------- Filter States -------------
  const [stateFilter, setStateFilter] = useState<string>("N/A");
  const [typeFilter, setTypeFilter] = useState<string>("N/A");
  const [AuthorizedAsFilter, setAuthorizedAsFilter] = useState<string>("N/A");
  const [teamFilter, setTeamFilter] = useState<string>("N/A");
  const [portfolioFilter, setPortfolioFilter] = useState<string>("N/A");
  const [sprintFilter, setSprintFilter] = useState<string>("N/A");
  const [idSearch, setIdSearch] = useState<string>("");
  const [tagSearch, setTagSearch] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");



  // ------------- Date Range -------------
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // ------------- Sorting -------------
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // ------------- Pagination -------------
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // ------------- Grouping -------------
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // ------------- Row expansions -------------
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // ------------- Modal / Panel -------------
  const [selectedWorkItem, setSelectedWorkItem] = useState<TFSWorkItem | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // ------------- Filter Drawer -------------
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ------------- Analytics -------------
  const [showAnalytics, setShowAnalytics] = useState(false);

  // ------------- Columns -------------
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "id", label: "ID", visible: true, pinned: true },
    { key: "title", label: "Title", visible: true, pinned: true },
    { key: "workItemType", label: "Type", visible: true },
    { key: "state", label: "State", visible: true },
    { key: "AuthorizedAs", label: "Assigned", visible: true },
    { key: "team", label: "Team", visible: true },
    { key: "sprint", label: "Sprint", visible: true },
    { key: "tags", label: "Tags", visible: true },
    { key: "actions", label: "Actions", visible: true },
  ]);

  // ------------- Multi-Select (Optional) -------------
  // TODO: allow selecting multiple rows for bulk export or actions:
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  // ------------- TFS Base URL -------------
  const tfsBaseUrl = process.env.NEXT_PUBLIC_TFS_BASE_URL || "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel";

  // ======= FETCH DATA ON MOUNT =======
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/tfs");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch data: ${response.statusText}`
          );
        }
        const result: TFSWorkItem[] = await response.json();
        const withParsedTags = result.map((item) => {
          const rawTags = item.system.tags || "";
          const parsedTags = rawTags
            .split(";")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          return { ...item, parsedTags };
        });
        setData(withParsedTags);
        setFilteredData(withParsedTags);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ======= LOAD / SAVE PREFERENCES (localStorage) =======
  useEffect(() => {
    const saved = localStorage.getItem("tfsFilterData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStateFilter(parsed.stateFilter ?? "N/A");
        setTypeFilter(parsed.typeFilter ?? "N/A");
        setAuthorizedAsFilter(parsed.AuthorizedAsFilter ?? "N/A");
        setTeamFilter(parsed.teamFilter ?? "N/A");
        setSprintFilter(parsed.sprintFilter ?? "N/A");
        setIdSearch(parsed.idSearch ?? "");
        setTagSearch(parsed.tagSearch ?? "");
        setTagFilter(parsed.tagFilter ?? "");
        if (parsed.dateRange) setDateRange(parsed.dateRange);
        setGroupBy(parsed.groupBy ?? "none");
      } catch (e) {
        console.error("Error restoring filters:", e);
      }
    }
    const storedCols = localStorage.getItem("tfsColumnData");
    if (storedCols) {
      try {
        const parsedCols = JSON.parse(storedCols);
        setColumns(parsedCols);
      } catch (e) {
        console.error("Error restoring columns:", e);
      }
    }
  }, []);

  useEffect(() => {
    const prefs = {
      stateFilter,
      typeFilter,
      AuthorizedAsFilter,
      teamFilter,
      sprintFilter,
      idSearch,
      tagSearch,
      tagFilter,
      dateRange,
      groupBy,
    };
    localStorage.setItem("tfsFilterData", JSON.stringify(prefs));
  }, [
    stateFilter,
    typeFilter,
    AuthorizedAsFilter,
    teamFilter,
    sprintFilter,
    idSearch,
    tagSearch,
    tagFilter,
    dateRange,
    groupBy,
  ]);

  useEffect(() => {
    localStorage.setItem("tfsColumnData", JSON.stringify(columns));
  }, [columns]);

  // ======= FILTER LOGIC =======
  const applyFilters = useCallback(() => {
    let result: TFSWorkItem[] = [...data];
    if (stateFilter !== "N/A") {
      result = result.filter((i) => i.system.State === stateFilter);
    }
    if (typeFilter !== "N/A") {
      result = result.filter((i) => i.system.WorkItemType === typeFilter);
    }
    if (AuthorizedAsFilter !== "N/A") {
      result = result.filter((i) => i.system.AuthorizedAs === AuthorizedAsFilter);
    }
    if (teamFilter !== "N/A") {
      result = result.filter((i) => i.costcoTravel.Team === teamFilter);
    }
    if (sprintFilter !== "N/A") {
      result = result.filter(
        (i) => i.system.IterationPath?.split("\\").pop() === sprintFilter
      );
    }
    if (dateRange?.from && dateRange.to) {
      const { from, to } = dateRange;
      result = result.filter((i) => {
        const created = parseISO(i.system.CreatedDate);
        return isWithinInterval(created, {
          start: startOfDay(from),
          end: endOfDay(to),
        });
      });
    }
    if (idSearch.trim()) {
      const idNum = parseInt(idSearch, 10);
      if (!isNaN(idNum)) {
        result = result.filter((i) => i.id === idNum);
      }
    }
    if (tagSearch.trim()) {
      const ts = tagSearch.toLowerCase();
      // TODO: implement "fuzzy" search with a library like fuse.js so we can match partial tags
      result = result.filter((i) =>
        i.parsedTags.some((tag) => tag.toLowerCase().includes(ts))
      );
    }
    if (tagFilter && tagFilter !== "ALL_TAGS") {
      result = result.filter((i) => i.parsedTags.includes(tagFilter));
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [
    data,
    stateFilter,
    typeFilter,
    AuthorizedAsFilter,
    teamFilter,
    sprintFilter,
    dateRange,
    idSearch,
    tagSearch,
    tagFilter,
  ]);

  const debouncedFilter = useMemo(() => debounce(applyFilters, 300), [applyFilters]);
  useEffect(() => {
    debouncedFilter();
    return () => debouncedFilter.cancel();
  }, [debouncedFilter]);

  // ======= SORTING =======
  const handleSort = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      setSortConfig({ key, direction: "ascending" });
    } else {
      setSortConfig((prev) => {
        if (!prev) return { key, direction: "ascending" };
        if (prev.direction === "ascending") {
          return { key, direction: "descending" };
        }
        return null; // remove sort
      });
    }
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const sorted = [...filteredData].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (key) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "title":
          aVal = a.system.Title;
          bVal = b.system.Title;
          break;
        case "workItemType":
          aVal = a.system.WorkItemType;
          bVal = b.system.WorkItemType;
          break;
        case "state":
          aVal = a.system.State;
          bVal = b.system.State;
          break;
        case "AuthorizedAs":
          aVal = a.system.AuthorizedAs;
          bVal = b.system.AuthorizedAs;
          break;
        case "team":
          aVal = a.costcoTravel.Team;
          bVal = b.costcoTravel.Team;
          break;
        case "sprint":
          aVal = a.system.IterationPath?.split("\\").pop() || "";
          bVal = b.system.IterationPath?.split("\\").pop() || "";
          break;
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // ======= GROUPING =======
  // We produce either "ungroupedData" as TFSWorkItem[] or "groupedData" as GroupedRecord[].
  const ungroupedData: TFSWorkItem[] = useMemo(() => {
    // only if groupBy === 'none'
    return sortedData;
  }, [sortedData]);

  const groupedData: GroupedRecord[] = useMemo(() => {
    if (groupBy === "none") return [];
    const map = new Map<string, TFSWorkItem[]>();
    for (const item of sortedData) {
      let keyVal = "";
      if (groupBy === "state") {
        keyVal = item.system.State;
      } else if (groupBy === "team") {
        keyVal = item.costcoTravel.Team;
      }
      if (!map.has(keyVal)) {
        map.set(keyVal, []);
      }
      map.get(keyVal)!.push(item);
    }
    return Array.from(map.entries()).map(([groupKey, items]) => ({
      groupKey,
      items,
    }));
  }, [sortedData, groupBy]);

  // Helper to flatten grouped data for exports or counts
  const getAllItems = (): TFSWorkItem[] => {
    if (groupBy === "none") {
      return ungroupedData;
    } else {
      return groupedData.flatMap((group) => group.items);
    }
  };

  // Collapsible group toggling
  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const copy = new Set(prev);
      if (copy.has(groupKey)) {
        copy.delete(groupKey);
      } else {
        copy.add(groupKey);
      }
      return copy;
    });
  };

  // ======= PAGINATION =======
  // For ungrouped data, we paginate. For grouped data, we show everything at once. 
  const totalPages = useMemo(() => {
    if (groupBy !== "none") return 1; // no paging for grouped
    return Math.ceil(ungroupedData.length / pageSize);
  }, [groupBy, ungroupedData.length, pageSize]);

  const pageData = useMemo(() => {
    if (groupBy !== "none") {
      return groupedData; // entire groups
    } else {
      const startIndex = (currentPage - 1) * pageSize;
      return ungroupedData.slice(startIndex, startIndex + pageSize);
    }
  }, [groupedData, ungroupedData, currentPage, groupBy]);

  // ======= TAG COUNTS =======
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((wi) => {
      wi.parsedTags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [data]);

  // ======= UNIQUE SPRINTS =======
  const uniqueSprints = useMemo(() => {
    const sprints = data
      .map((item) => item.system.IterationPath?.split("\\").pop() || "")
      .filter((s) => s);
    return Array.from(new Set(sprints)).sort();
  }, [data]);

  // ======= EXPANDED ROWS =======
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  // ======= SELECT MULTIPLE ROWS (Optional) =======
  const toggleRowSelection = (id: number) => {
    setSelectedRowIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  // ======= CLEAR ALL FILTERS =======
  function clearAllFilters() {
    setStateFilter("N/A");
    setTypeFilter("N/A");
    setAuthorizedAsFilter("N/A");
    setTeamFilter("N/A");
    setSprintFilter("N/A");
    setIdSearch("");
    setTagSearch("");
    setTagFilter("");
    setDateRange(undefined);
  }


  const [filterState, setFilterState] = useState<any>({
    stateFilter: "N/A",
    typeFilter: "N/A",
    AuthorizedAsFilter: "N/A",
    teamFilter: "N/A",
    sprintFilter: "N/A",
    idSearch: "",
    tagSearch: "",
    dateRange: undefined,
  });

  // ======= EXPORTS =======
  const handleExportCSV = () => {
    const allItems = getAllItems();
    const headers = columns
      .filter((c) => c.visible && c.key !== "actions")
      .map((c) => c.label);

    const rows = allItems.map((item) =>
      columns
        .filter((c) => c.visible && c.key !== "actions")
        .map((col) => {
          switch (col.key) {
            case "id":
              return item.id;
            case "title":
              return `"${item.system.Title}"`;
            case "workItemType":
              return item.system.WorkItemType;
            case "state":
              return item.system.State;
            case "AuthorizedAs":
              return item.system.AuthorizedAs;
            case "team":
              return item.costcoTravel.Team;
            case "sprint":
              return item.system.IterationPath?.split("\\").pop() || "";
            case "tags":
              return item.parsedTags.join(";");
            default:
              return "";
          }
        })
        .join(",")
    );

    const csvContent = headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tfs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  const debouncedApplyFilters = useMemo(() => debounce(applyFilters, 300), [applyFilters]);

  useEffect(() => {
    debouncedApplyFilters();
    return () => debouncedApplyFilters.cancel();
  }, [filterState, debouncedApplyFilters]);

  const handleClearFilters = () => {
    setFilterState({
      stateFilter: "N/A",
      typeFilter: "N/A",
      AuthorizedAsFilter: "N/A",
      teamFilter: "N/A",
      sprintFilter: "N/A",
      idSearch: "",
      tagSearch: "",
      dateRange: undefined,
    });
  };




  // ======= SIDE PANEL =======
  const openSidePanel = (item: TFSWorkItem) => {
    setSelectedWorkItem(item);
    setShowSidePanel(true);
  };
  const closeSidePanel = () => {
    setShowSidePanel(false);
  };

  // ======= ANALYTICS DATA =======
  const analyticsData = useMemo(() => {
    // Distribution by WorkItemType
    const dist: Record<string, number> = {};
    filteredData.forEach((wi) => {
      const type = wi.system.WorkItemType;
      dist[type] = (dist[type] || 0) + 1;
    });
    return Object.entries(dist).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [filteredData]);

  // Custom color palette
  const analyticsColors = ["#4ade80", "#f87171", "#fde047", "#a5b4fc", "#9ca3af"];

  // ======= FILTER PRESETS =======
  const filterPresets = [
    {
      label: "Show Only Bugs",
      apply: () => {
        setTypeFilter("Bug");
        setStateFilter("N/A");
        setAuthorizedAsFilter("N/A");
        setTeamFilter("N/A");
        setSprintFilter("N/A");
        setIdSearch("");
        setTagSearch("");
        setTagFilter("");
        setDateRange(undefined);
      },
    },
    {
      label: "Show Only In-Progress",
      apply: () => {
        setStateFilter("In Progress");
        setTypeFilter("N/A");
        setAuthorizedAsFilter("N/A");
        setTeamFilter("N/A");
        setSprintFilter("N/A");
        setIdSearch("");
        setTagSearch("");
        setTagFilter("");
        setDateRange(undefined);
      },
    },
  ];

  // ======= RENDER =======
  return (
    <div className="relative w-full min-h-screen p-4 text-gray-800 dark:text-gray-100 transition-colors">
      {/* Side Panel */}
      <SidePanel show={showSidePanel} data={selectedWorkItem} close={closeSidePanel} />
     

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-medium tracking-wider">
          Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          {filterPresets.map((fp) => (
            <Button
              key={fp.label}
              variant="default"
              size="sm"
              onClick={fp.apply}
            >
              {fp.label}
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setShowAnalytics((p) => !p)}>
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileDown className="w-4 h-4 mr-1" />
            CSV
          </Button>

          <Button variant="outline" size="sm" onClick={() => setFiltersOpen((p) => !p)}>
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      <AnalyticsPanel 
        show={showAnalytics} 
        data={analyticsData} 
        colors={analyticsColors} 
      />

      {/* TODO: Move to FilterPanel.tsx */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="filter-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 bg-white dark:bg-gray-950 shadow-2xl border-l border-gray-300 dark:border-gray-700 p-6 overflow-auto transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Separator className="mb-4 dark:bg-gray-600" />

            {/* State Filter */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">State</label>
              <CustomFilter
                filter={stateFilter}
                setFilter={setStateFilter}
                data={data}
                dataKey="system.State"
              />
            </div>

            {/* Type Filter */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Type</label>
              <CustomFilter
                filter={typeFilter}
                setFilter={setTypeFilter}
                data={data}
                dataKey="system.WorkItemType"
              />
            </div>

            {/* Assigned To */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Assigned To</label>
              <CustomFilter
                filter={AuthorizedAsFilter}
                setFilter={setAuthorizedAsFilter}
                data={data}
                dataKey="system.AuthorizedAs"
              />
            </div>

            {/* Team Filter */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Team</label>
              <CustomFilter
                filter={teamFilter}
                setFilter={setTeamFilter}
                data={data}
                dataKey="costcoTravel.Team"
              />
            </div>

            {/* Sprint Filter */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Sprint</label>
              <Select onValueChange={(val) => setSprintFilter(val)} value={sprintFilter}>
                <SelectTrigger className="w-full dark:border-gray-700">
                  <SelectValue placeholder="All Sprints" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sprints</SelectLabel>
                    <SelectItem value="N/A">All</SelectItem>
                    {uniqueSprints.map((sp) => (
                      <SelectItem key={sp} value={sp}>
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* ID Search */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">ID Search</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. 12345"
                value={idSearch}
                onChange={(e) => setIdSearch(e.target.value)}
              />
            </div>

            {/* Tag partial search */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Tag Search</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g. regression"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>

            {/* Tag exact filter */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Tag Filter</label>
              <Select onValueChange={(val) => setTagFilter(val)} value={tagFilter}>
                <SelectTrigger className="w-full dark:border-gray-700">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tags</SelectLabel>
                    <SelectItem value="ALL_TAGS">All</SelectItem>
                    {Object.entries(tagCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, count]) => (
                        <SelectItem key={tag} value={tag}>
                          {tag} ({count})
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Grouping */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Group By</label>
              <Select onValueChange={(val) => setGroupBy(val as GroupBy)} value={groupBy}>
                <SelectTrigger className="w-full dark:border-gray-700">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Group By</SelectLabel>
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="mb-2 text-center">
              {/* <label className="block text-sm font-medium mb-2">Filter by Date Range</label> */}
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md w-full border shadow-sm flex items-center justify-center"
              />
            </div>
            {/* Quick Date Presets, etc. */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    from: new Date(Date.now() - 7 * 86400000),
                    to: new Date(),
                  })
                }
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    from: new Date(Date.now() - 30 * 86400000),
                    to: new Date(),
                  })
                }
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDateRange({
                    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    to: new Date(),
                  })
                }
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange(undefined)}
              >
                All Time
              </Button>
            </div>



            {/* Clear all filters */}
            <Button variant="destructive" className="w-full" onClick={clearAllFilters}>
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center mt-4">
          <Loading />
        </div>
      )}
      {error && (
        <div className="text-center text-red-400 text-sm mt-4">
          <p>{error}</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="border p-4 rounded-md shadow bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors">
          {/* Column toggles */}
          <div className="flex flex-wrap gap-2 mb-2">
            {columns.map((col) => (
              <Button
                key={`toggle-${col.key}`}
                variant={col.visible ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setColumns((prev) =>
                    prev.map((c) =>
                      c.key === col.key ? { ...c, visible: !c.visible } : c
                    )
                  )
                }
              >
                {col.visible ? `Hide ${col.label}` : `Show ${col.label}`}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border relative">
              {/* Thead */}
              <thead className="sticky top-0 bg-gray-200 dark:bg-gray-800 z-10">
                <tr className="border-b border-gray-300 dark:border-gray-600 uppercase tracking-wider">

                  {/* Optional: Multi-select header cell */}
                  {/* "Select All" checkbox, place it here.
                      Example:
                      <th className="p-3 w-10 text-center">
                        <input type="checkbox" ... />
                      </th>
                  */}
                  {columns.map((col, index) => {
                    if (!col.visible) return null;
                    return (
                      <th
                        key={col.key}
                        onClick={
                          col.key !== "actions"
                            ? () => handleSort(col.key as SortKey)
                            : undefined
                        }
                        className={cn(
                          "py-3 px-4 text-left font-semibold select-none border-b border-gray-300 dark:border-gray-600",
                          col.key !== "actions" && "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600",
                          col.pinned && "sticky left-0 z-20 bg-gray-300 dark:bg-gray-800"
                        )}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <div className="flex items-center space-x-1">
                          <Move className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 cursor-move" />
                          <span>{col.label}</span>
                          {sortConfig?.key === col.key && (
                            <span>
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Tbody - if groupBy = 'none', we use pageData as TFSWorkItem[]. If groupBy != 'none', pageData is GroupedRecord[]. */}
              {groupBy === "none" ? (
                <tbody>
                  {(pageData as TFSWorkItem[]).length > 0 ? (
                    (pageData as TFSWorkItem[]).map((item, idx) => {
                      const isExpanded = expandedRows.has(item.id);
                      const isSelected = selectedRowIds.has(item.id);
                      const rowBg =
                        idx % 2 === 0
                          ? "bg-gray-100 dark:bg-gray-950"
                          : "bg-gray-200 dark:bg-gray-950/50";
                      return (
                        <React.Fragment key={item.id}>
                          <tr className={cn("border-b border-gray-300 dark:border-gray-600", rowBg)}>
                            {columns.map((col) => {
                              if (!col.visible) return null;
                              switch (col.key) {
                                case "id":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      <div className="flex items-center space-x-2">
                                        {/* Multi-select checkbox (optional) */}
                                        <button
                                          className="text-gray-500"
                                          onClick={() => toggleRowSelection(item.id)}
                                          title="Select Row"
                                        >
                                          {isSelected ? (
                                            <CheckSquare className="h-4 w-4" />
                                          ) : (
                                            <Square className="h-4 w-4" />
                                          )}
                                        </button>
                                        <button
                                          className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider hover:underline"
                                          onClick={() => toggleRowExpansion(item.id)}
                                        >
                                          {item.id}
                                        </button>
                                      </div>
                                    </td>
                                  );
                                case "title":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4 font-medium">
                                      <a
                                        href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 dark:text-blue-400 tracking-wider hover:underline"
                                      >
                                        {highlightMatch(item.system.Title, tagSearch)}
                                      </a>
                                    </td>
                                  );
                                case "workItemType":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-1">
                                      <Badge ticketType={mapWorkItemType(item.system.WorkItemType)}>
                                        {item.system.WorkItemType}
                                      </Badge>
                                    </td>
                                  );
                                case "state":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      <Badge state={mapState(item.system.State)}>
                                        {item.system.State}
                                      </Badge>
                                    </td>
                                  );
                                case "AuthorizedAs":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      <Badge variant="secondary" className="text-xs border border-gray-300 dark:border-gray-600 w-full">
                                      {item.system.AuthorizedAs.includes("Microsoft.TeamFoundation.System")
                                        ? "Unassigned"
                                        : item.system.AuthorizedAs.split("\\").pop()?.replace("c_", "").replace(">", "").replace(".", " ")
                                      }
                                      </Badge>
                                     
                                    </td>
                                  );
                                case "team":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      {item.costcoTravel.Team}
                                    </td>
                                  );
                                case "sprint":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      {item.system.IterationPath?.split("\\").pop() || "N/A"}
                                    </td>
                                  );
                                case "tags":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      {item.parsedTags.length > 0 ? (
                                        item.parsedTags.map((tag) => (
                                          <Badge
                                            key={tag}
                                            className="mr-1 my-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                          >
                                            {highlightMatch(tag, tagSearch)}
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          N/A
                                        </Badge>
                                      )}
                                    </td>
                                  );
                                case "actions":
                                  return (
                                    <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => openSidePanel(item)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </td>
                                  );
                                default:
                                  return <td key={`${col.key}-${item.id}`}>N/A</td>;
                              }
                            })}
                          </tr>
                          {/* Expanded row */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                key="expanded-row"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600"
                              >
                                <td
                                  colSpan={columns.filter((c) => c.visible).length}
                                  className="p-4 text-sm"
                                >
                                  <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-semibold mb-2">Linked Items</h4>
                                      {item.relations && item.relations.length ? (
                                        <ul className="list-disc ml-5 space-y-1">
                                          {item.relations.map((rel, idx2) => (
                                            <li key={idx2}>
                                              {rel.rel} -{" "}
                                              <a
                                                href={rel.url}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                {rel.url}
                                              </a>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs italic text-gray-400 dark:text-gray-500">
                                          No relations found
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <strong>Description:</strong>
                                      <p className="text-xs mt-1">
                                        {item.systemDescription || (
                                          <span className="italic text-gray-400 dark:text-gray-500">
                                            No description
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.filter((c) => c.visible).length}
                        className="py-4 px-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        No work items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              ) : (
                // GROUPED TABLE
                <tbody>
                  {(pageData as GroupedRecord[]).map((group) => {
                    const isCollapsed = collapsedGroups.has(group.groupKey);
                    return (
                      <React.Fragment key={group.groupKey}>
                        <tr className="bg-gray-200 dark:bg-gray-900 font-semibold border-b border-gray-300 dark:border-gray-700">
                          <td
                            colSpan={columns.filter((c) => c.visible).length}
                            className="py-2 px-4 cursor-pointer"
                            onClick={() => toggleGroup(group.groupKey)}
                          >
                            <div className="flex items-center space-x-2">
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span>
                                {groupBy === "state" ? "State" : "Team"}: {group.groupKey} (
                                {group.items.length})
                              </span>
                            </div>
                          </td>
                        </tr>
                        {!isCollapsed &&
                          group.items.map((item) => {
                            const isExpanded = expandedRows.has(item.id);
                            const isSelected = selectedRowIds.has(item.id);
                            return (
                              <React.Fragment key={item.id}>
                                <tr className="border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                  {columns.map((col) => {
                                    if (!col.visible) return null;
                                    switch (col.key) {
                                      case "id":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                              <button
                                                className="text-gray-500"
                                                onClick={() => toggleRowSelection(item.id)}
                                              >
                                                {isSelected ? (
                                                  <CheckSquare className="h-4 w-4" />
                                                ) : (
                                                  <Square className="h-4 w-4" />
                                                )}
                                              </button>
                                              <button
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                                onClick={() => toggleRowExpansion(item.id)}
                                              >
                                                {item.id}
                                              </button>
                                            </div>
                                          </td>
                                        );
                                      case "title":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4 font-medium">
                                            <a
                                              href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                              {highlightMatch(item.system.Title, tagSearch)}
                                            </a>
                                          </td>
                                        );
                                      case "workItemType":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            <Badge
                                              ticketType={mapWorkItemType(item.system.WorkItemType)}
                                            >
                                              {item.system.WorkItemType}
                                            </Badge>
                                          </td>
                                        );
                                      case "state":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            <Badge state={mapState(item.system.State)}>
                                              {item.system.State}
                                            </Badge>
                                          </td>
                                        );
                                      case "AuthorizedAs":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            {item.system.AuthorizedAs.includes(
                                              "Microsoft.TeamFoundation.System"
                                            )
                                              ? "Unassigned"
                                              : item.system.AuthorizedAs}
                                          </td>
                                        );
                                      case "team":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            {item.costcoTravel.Team}
                                          </td>
                                        );
                                      case "sprint":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            {item.system.IterationPath?.split("\\").pop() || "N/A"}
                                          </td>
                                        );
                                      case "tags":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            {item.parsedTags.length > 0 ? (
                                              item.parsedTags.map((t) => (
                                                <Badge
                                                  key={t}
                                                  className="mr-1 my-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                  {highlightMatch(t, tagSearch)}
                                                </Badge>
                                              ))
                                            ) : (
                                              <Badge variant="secondary" className="text-xs">
                                                N/A
                                              </Badge>
                                            )}
                                          </td>
                                        );
                                      case "actions":
                                        return (
                                          <td key={`${col.key}-${item.id}`} className="py-3 px-4">
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() => openSidePanel(item)}
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              View
                                            </Button>
                                          </td>
                                        );
                                      default:
                                        return <td key={`${col.key}-${item.id}`}>N/A</td>;
                                    }
                                  })}
                                </tr>
                                {/* expanded row */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.tr
                                      key="expanded-row"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600"
                                    >
                                      <td
                                        colSpan={columns.filter((c) => c.visible).length}
                                        className="p-4 text-sm"
                                      >
                                        <div className="flex flex-col md:flex-row gap-4">
                                          <div className="flex-1">
                                            <h4 className="font-semibold mb-2">Linked Items</h4>
                                            {item.relations && item.relations.length ? (
                                              <ul className="list-disc ml-5 space-y-1">
                                                {item.relations.map((rel, idx2) => (
                                                  <li key={idx2}>
                                                    {rel.rel} -{" "}
                                                    <a
                                                      href={rel.url}
                                                      className="text-blue-600 dark:text-blue-400 hover:underline"
                                                      target="_blank"
                                                      rel="noreferrer"
                                                    >
                                                      {rel.url}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <p className="text-xs italic text-gray-400 dark:text-gray-500">
                                                No relations found
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <strong>Description:</strong>
                                            <p className="text-xs mt-1">
                                              {item.systemDescription || (
                                                <span className="italic text-gray-400 dark:text-gray-500">
                                                  No description
                                                </span>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination for ungrouped only */}
          {groupBy === "none" && ungroupedData.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            />
          )}
        </div>
      )}
    </div>
  );
}
