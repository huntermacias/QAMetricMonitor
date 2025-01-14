"use client";

import React, {
  ChangeEvent,
  FC,
  useEffect,
  useMemo,
  useState,
} from "react";
import debounce from "lodash.debounce";
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

import BugModal from "./_components/BugModal";
import Loading from "@/components/Loading";
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
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

import { DateRange } from "react-day-picker"; // Import DateRange from react-day-picker

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
    CreatedDate: string; // e.g. "2024-12-06T23:24:07.62Z"
    IterationPath?: string;
  };
  costcoTravel: {
    Team: string;
  };
  parsedTags: string[];
  systemDescription?: string;
  relations: any;
}

// Sorting keys
type SortKey =
  | "id"
  | "title"
  | "workItemType"
  | "state"
  | "AuthorizedAs"
  | "team"
  | "sprint";

// Sorting config
interface SortConfig {
  key: SortKey;
  direction: "ascending" | "descending";
}

// Team variant mappings
const teamMapping: Record<
  string,
  "shoppingteam1" | "shoppingteam2" | "travelteam"
> = {
  "Shopping Team 1": "shoppingteam1",
  "Shopping Team 2": "shoppingteam2",
  "Travel Team": "travelteam",
};

// Map TFS WorkItemType to badge variants
function mapWorkItemType(type: string) {
  switch (type.toLowerCase()) {
    case "user story":
      return "userstory";
    case "bug":
      return "bug";
    case "task":
      return "task";
    case "feature":
      return "feature";
    case "epic":
      return "epic";
    default:
      return undefined;
  }
}

// Map TFS State to badge variants
function mapState(state: string) {
  switch (state.toLowerCase()) {
    case "in progress":
      return "inprogress";
    case "planned":
      return "planned";
    case "released":
      return "released";
    case "committed":
      return "committed";
    case "closed":
      return "closed";
    default:
      return undefined;
  }
}

const TFSPage: FC = () => {
  // Data
  const [data, setData] = useState<TFSWorkItem[]>([]);
  const [filteredData, setFilteredData] = useState<TFSWorkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [stateFilter, setStateFilter] = useState<string>("N/A");
  const [typeFilter, setTypeFilter] = useState<string>("N/A");
  const [AuthorizedAsFilter, setAuthorizedAsFilter] = useState<string>("N/A");
  const [teamFilter, setTeamFilter] = useState<string>("N/A");
  const [sprintFilter, setSprintFilter] = useState<string>("N/A");

  // Tag-based searching
  const [idSearch, setIdSearch] = useState<string>("");
  const [tagSearch, setTagSearch] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // DateRange filter (from Calendar range)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Modal
  const [selectedWorkItem, setSelectedWorkItem] =
    useState<TFSWorkItem | null>(null);

  // TFS Base URL
  const tfsBaseUrl =
    process.env.NEXT_PUBLIC_TFS_BASE_URL ||
    "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel";

  // Fetch Data
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
        // Add parsed tags
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

  // Tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((wi) => {
      wi.parsedTags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [data]);

  // Unique sprints
  const uniqueSprints = useMemo(() => {
    const sprints = data
      .map((item) => item.system.IterationPath?.split("\\").pop() || "")
      .filter((sprint) => sprint !== "");
    return Array.from(new Set(sprints)).sort();
  }, [data]);

  // Debounced Filter
  const debouncedApplyFilters = useMemo(
    () =>
      debounce(() => {
        applyFilters();
      }, 300),
    [
      stateFilter,
      typeFilter,
      AuthorizedAsFilter,
      teamFilter,
      sprintFilter,
      idSearch,
      tagSearch,
      tagFilter,
      dateRange,
      data,
    ]
  );

  useEffect(() => {
    debouncedApplyFilters();
    return () => {
      debouncedApplyFilters.cancel();
    };
  }, [debouncedApplyFilters]);

  /** The main filter function */
  function applyFilters(): void {
    let filtered: TFSWorkItem[] = [...data];

    // 1) Filter by State
    if (stateFilter && stateFilter !== "N/A") {
      filtered = filtered.filter((item) => item.system.State === stateFilter);
    }

    // 2) Filter by Type
    if (typeFilter && typeFilter !== "N/A") {
      filtered = filtered.filter(
        (item) => item.system.WorkItemType === typeFilter
      );
    }

    // 3) Filter by QA Resource
    if (AuthorizedAsFilter && AuthorizedAsFilter !== "N/A") {
      filtered = filtered.filter(
        (item) => item.system.AuthorizedAs === AuthorizedAsFilter
      );
    }

    // 4) Filter by Team
    if (teamFilter && teamFilter !== "N/A") {
      filtered = filtered.filter(
        (item) => item.costcoTravel.Team === teamFilter
      );
    }

    // 5) Filter by Sprint
    if (sprintFilter && sprintFilter !== "N/A") {
      filtered = filtered.filter(
        (item) =>
          item.system.IterationPath?.split("\\").pop() === sprintFilter
      );
    }

    // 6) Filter by Date Range (CreatedDate)
    if (dateRange?.from && dateRange.to) {
      const { from, to } = dateRange;
    
      filtered = filtered.filter((item) => {
        const created = parseISO(item.system.CreatedDate); // e.g., "2024-12-06T23:24:07.62Z"
        return isWithinInterval(created, {
          start: startOfDay(from),
          end: endOfDay(to),
        });
      });
    }
    

    // 7) Search by ID
    if (idSearch.trim() !== "") {
      const idNumber = parseInt(idSearch, 10);
      if (!isNaN(idNumber)) {
        filtered = filtered.filter((item) => item.id === idNumber);
      }
    }

    // 8) Search by Tag (partial match)
    if (tagSearch.trim() !== "") {
      const searchTag = tagSearch.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.parsedTags.some((t) => t.toLowerCase().includes(searchTag))
      );
    }

    // 9) Filter by exact Tag
    if (tagFilter) {
      filtered = filtered.filter((item) =>
        item.parsedTags.includes(tagFilter)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }

  function handleSort(key: SortKey): void {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const sorted = [...filteredData].sort((a, b) => {
      let aValue: number | string = "";
      let bValue: number | string = "";

      switch (key) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "title":
          aValue = a.system.Title;
          bValue = b.system.Title;
          break;
        case "workItemType":
          aValue = a.system.WorkItemType;
          bValue = b.system.WorkItemType;
          break;
        case "state":
          aValue = a.system.State;
          bValue = b.system.State;
          break;
        case "AuthorizedAs":
          aValue = a.system.AuthorizedAs;
          bValue = b.system.AuthorizedAs;
          break;
        case "team":
          aValue = a.costcoTravel.Team;
          bValue = b.costcoTravel.Team;
          break;
        case "sprint":
          aValue = a.system.IterationPath?.split("\\").pop() || "";
          bValue = b.system.IterationPath?.split("\\").pop() || "";
          break;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const displayData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage]);

  function clearAllFilters(): void {
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

  function getUniqueValues(
    filter: "state" | "type" | "AuthorizedAs" | "team"
  ): string[] {
    switch (filter) {
      case "state":
        return Array.from(new Set(data.map((item) => item.system.State)))
          .filter(Boolean)
          .sort();
      case "type":
        return Array.from(
          new Set(data.map((item) => item.system.WorkItemType))
        )
          .filter(Boolean)
          .sort();
      case "AuthorizedAs":
        return Array.from(
          new Set(data.map((item) => item.system.AuthorizedAs))
        )
          .filter(Boolean)
          .sort();
      case "team":
        return Array.from(
          new Set(data.map((item) => item.costcoTravel.Team))
        )
          .filter(Boolean)
          .sort();
      default:
        return [];
    }
  }

  // Preset Date Ranges
  const presetRanges = [
    {
      label: "Last 7 Days",
      range: {
        from: new Date(Date.now() - 7 * 86400000),
        to: new Date(),
      },
    },
    {
      label: "Last 30 Days",
      range: {
        from: new Date(Date.now() - 30 * 86400000),
        to: new Date(),
      },
    },
    {
      label: "This Month",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
    { label: "All Time", range: undefined }, // Use undefined to represent no filter
  ];

  return (
    <div className="min-h-screen p-4 text-xs space-y-6 w-full">
      <h1 className="text-center text-3xl font-extrabold mb-6 tracking-wide">
        TFS Work Items Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters + Table */}
        <div className="flex flex-col space-y-4 flex-1">
          {/* Filter Panel */}
          <div className="p-6 rounded-xl shadow-md flex flex-col lg:flex-row gap-6">
            {/* Column 1: State, Type, Resource, Team, Sprint */}
            <div className="flex flex-col space-y-4 flex-1">
              <Select onValueChange={(value) => setStateFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      stateFilter !== "N/A" ? stateFilter : "All States"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>State</SelectLabel>
                    <SelectItem value="N/A">All States</SelectItem>
                    {getUniqueValues("state").map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setTypeFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      typeFilter !== "N/A" ? typeFilter : "All Types"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <SelectItem value="N/A">All Types</SelectItem>
                    {getUniqueValues("type").map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setAuthorizedAsFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      AuthorizedAsFilter !== "N/A"
                        ? AuthorizedAsFilter
                        : "All Assigned"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>QA Resource</SelectLabel>
                    <SelectItem value="N/A">All Assigned</SelectItem>
                    {getUniqueValues("AuthorizedAs").map((authAs) => (
                      <SelectItem key={authAs} value={authAs}>
                        {authAs.includes("Microsoft.TeamFoundation.System")
                          ? "No Assigned Resource"
                          : authAs.split(" ").slice(0, 2).join(" ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setTeamFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      teamFilter !== "N/A" ? teamFilter : "All Teams"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Team</SelectLabel>
                    <SelectItem value="N/A">All Teams</SelectItem>
                    {getUniqueValues("team").map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setSprintFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      sprintFilter !== "N/A" ? sprintFilter : "All Sprints"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sprint</SelectLabel>
                    <SelectItem value="N/A">All Sprints</SelectItem>
                    {uniqueSprints.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Column 2: ID & Tag Search + Clear */}
            <div className="flex flex-col space-y-4 flex-1">
              {/* ID Search */}
              <div className="space-y-1">
                <p className="text-xs font-semibold">
                  Search by ID
                </p>
                <input
                  type="number"
                  placeholder="Search by ID"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={idSearch}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setIdSearch(e.target.value)
                  }
                />
              </div>

              {/* Tag Search */}
              <div className="space-y-1">
                <p className="text-xs font-semibold">
                  Search by Tag
                </p>
                <input
                  type="text"
                  placeholder="Search Tag"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={tagSearch}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTagSearch(e.target.value)
                  }
                />
              </div>

              {/* Clear All */}
              <button
                onClick={clearAllFilters}
                className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm w-full"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <Loading />
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm mt-4">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="rounded-xl shadow-md p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="border-b uppercase tracking-wider">
                      {[
                        { key: "id", label: "ID" },
                        { key: "title", label: "Title" },
                        { key: "workItemType", label: "Type" },
                        { key: "state", label: "State" },
                        { key: "AuthorizedAs", label: "QA Resource" },
                        { key: "team", label: "Team" },
                        { key: "sprint", label: "Sprint" },
                        { key: "tags", label: "Tags" },
                        { key: "", label: "Actions" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={
                            col.key
                              ? () => handleSort(col.key as SortKey)
                              : undefined
                          }
                          className={cn(
                            "py-3 px-4 text-left font-semibold cursor-pointer select-none",
                            col.key && "hover:bg-gray-500"
                          )}
                          style={{ whiteSpace: "nowrap" }}
                          aria-sort={
                            sortConfig?.key === col.key
                              ? sortConfig.direction === "ascending"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <div className="flex items-center space-x-1">
                            <span>{col.label}</span>
                            {col.key && sortConfig?.key === col.key && (
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
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.length > 0 ? (
                      displayData.map((item) => (
                        <tr
                          key={item.id}
                          className="transition-colors"
                        >
                          {/* ID */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            {item.id}
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <a
                              href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold italic tracking-wider text-blue-500 hover:underline"
                            >
                              {item.system.Title}
                            </a>
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <Badge
                              ticketType={mapWorkItemType(item.system.WorkItemType)}
                              className="w-24"
                            >
                              {item.system.WorkItemType}
                            </Badge>
                          </td>

                          {/* State */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <Badge
                              state={mapState(item.system.State)}
                              className="w-24"
                            >
                              {item.system.State}
                            </Badge>
                          </td>

                          {/* QA Resource */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            {item.system.AuthorizedAs.includes(
                              "Microsoft.TeamFoundation.System"
                            ) ? (
                              <span className="text-gray-500 italic">
                                No Assigned Resource
                              </span>
                            ) : (
                              item.system.AuthorizedAs.match(
                                /^(.*?)\s*<.*?>$/
                              )?.[1] ||
                              item.system.AuthorizedAs
                                .split(" ")
                                .slice(0, 2)
                                .join(" ")
                            )}
                          </td>

                          {/* Team */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <Badge
                              team={
                                teamMapping[item.costcoTravel.Team] || undefined
                              }
                              className="w-32"
                            >
                              {item.costcoTravel.Team}
                            </Badge>
                          </td>

                          {/* Sprint */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <Badge
                              sprint={
                                item.system.IterationPath?.includes("Sprint01")
                                  ? "current"
                                  : item.system.IterationPath?.includes("FY25")
                                  ? "upcoming"
                                  : "past"
                              }
                              className="w-40 tracking-wider"
                            >
                              {item.system.IterationPath?.split("\\").pop()}
                            </Badge>
                          </td>

                          {/* Tags */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            {item.parsedTags.length > 0 ? (
                              item.parsedTags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  className="mr-1 my-1 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                N/A
                              </Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 border-b border-gray-200 text-left">
                            <button
                              onClick={() => setSelectedWorkItem(item)}
                              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-4 px-6 border-b border-gray-200 text-center text-gray-500"
                        >
                          No work items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sortedData.length > pageSize && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-500 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Prev
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-500 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: Tag + Date Range */}
        <div className="rounded-xl shadow-md space-y-6 border p-6">
          {/* Date Range Filter */}
          <div>
            <p className="font-semibold text-xs mb-2">
              Filter by Date Range
            </p>
            {/* Preset Ranges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setDateRange(preset.range)}
                  className={cn(
                    "px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                    dateRange?.from === preset.range?.from &&
                      dateRange?.to === preset.range?.to
                      ? "hpver:bg-gray-600"
                      : "hover:bg-gray-500"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {/* Calendar */}
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(val: DateRange | undefined) => {
                setDateRange(val);
              }}
              className="rounded-md border shadow-sm lg:w-64 "
            />

            {/* Display Selected Range */}
            <div className="mt-4 text-xs">
              {dateRange?.from && (
                <p>
                  <span className="font-semibold">From:</span>{" "}
                  {dateRange.from.toLocaleDateString()}
                </p>
              )}
              {dateRange?.to && (
                <p>
                  <span className="font-semibold">To:</span>{" "}
                  {dateRange.to.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Separator */}
          <Separator />

          {/* Tag Filter */}
          <div>
            <Select onValueChange={(value) => setTagFilter(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tagFilter || "Select a tag"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tags</SelectLabel>
                  {Object.entries(tagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tag, count]) => (
                      <SelectItem key={tag} value={tag}>
                        {tag} - {count}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Tag partial match search */}
            <div className="mt-4 flex flex-col space-y-1">
              <label className="text-xs font-semibold">
                Search Tag
              </label>
              <input
                type="text"
                placeholder="Search Tag"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>

            {/* Clear Tag-based filters */}
            {(tagFilter || tagSearch) && (
              <button
                onClick={() => {
                  setTagFilter("");
                  setTagSearch("");
                }}
                className="mt-3 flex items-center text-sm text-blue-500 hover:underline focus:outline-none"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Tag Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedWorkItem && (
        <BugModal
          selectedWorkItem={selectedWorkItem}
          setSelectedWorkItem={setSelectedWorkItem}
        />
      )}
    </div>
  );
};

export default TFSPage;
