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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@radix-ui/react-separator";
import { mockTFSWorkItems } from "@/resources/mock-data";
import { ChevronDown, ChevronUp } from "lucide-react";
import StatisticCard from "./_components/StatisticCard";
import { Checkbox } from "@/components/ui/checkbox";

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
}

// Sorting keys
type SortKey = "id" | "title" | "workItemType" | "state" | "AuthorizedAs" | "team" | "sprint";

// Sorting config
interface SortConfig {
  key: SortKey;
  direction: "ascending" | "descending";
}

// DateRange type for the Calendar
interface DateRange {
  from?: Date;
  to?: Date;
}

// Team variant mappings
const teamMapping: Record<string, "shoppingteam1" | "shoppingteam2" | "travelteam"> = {
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
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [AuthorizedAsFilter, setAuthorizedAsFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [sprintFilter, setSprintFilter] = useState("");

  // Tag-based searching
  const [idSearch, setIdSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // DateRange filter (from Calendar range)
  const [dateRange, setDateRange] = useState<DateRange>({});

  // Modal
  const [selectedWorkItem, setSelectedWorkItem] = useState<TFSWorkItem | null>(null);

  // TFS Base URL
  const tfsBaseUrl = process.env.NEXT_PUBLIC_TFS_BASE_URL || "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
          // Use mock data
          const withParsedTags = mockTFSWorkItems.map((item) => {
            const rawTags = item.system.tags || "";
            const parsedTags = rawTags
              .split(";")
              .map((t:any) => t.trim())
              .filter((t:any) => t.length > 0);
            return { ...item, parsedTags };
          });
          setData(withParsedTags);
          setFilteredData(withParsedTags);
        } else {
          // Fetch real data
          const response = await fetch("/api/tfs");
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch data: ${response.statusText}`);
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
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }

        // Optionally, fallback to mock data on error
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true") {
          console.warn("Falling back to mock data due to fetch error.");
          const withParsedTags = mockTFSWorkItems.map((item) => {
            const rawTags = item.system.tags || "";
            const parsedTags = rawTags
              .split(";")
              .map((t:any) => t.trim())
              .filter((t:any) => t.length > 0);
            return { ...item, parsedTags };
          });
          setData(withParsedTags);
          setFilteredData(withParsedTags);
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
      filtered = filtered.filter((item) => item.system.WorkItemType === typeFilter);
    }

    // 3) Filter by QA Resource
    if (AuthorizedAsFilter && AuthorizedAsFilter !== "N/A") {
      filtered = filtered.filter((item) => item.system.AuthorizedAs === AuthorizedAsFilter);
    }

    // 4) Filter by Team
    if (teamFilter && teamFilter !== "N/A") {
      filtered = filtered.filter((item) => item.costcoTravel.Team === teamFilter);
    }

    // 5) Filter by Sprint
    if (sprintFilter && sprintFilter !== "N/A") {
      filtered = filtered.filter(
        (item) => item.system.IterationPath?.split("\\").pop() === sprintFilter
      );
    }

    // 6) Filter by Date Range (CreatedDate)
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((item) => {
        const created = parseISO(item.system.CreatedDate);
        return isWithinInterval(created, {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!),
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
      filtered = filtered.filter((item) => item.parsedTags.includes(tagFilter));
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }

  function handleSort(key: SortKey): void {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
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

      // Numeric sort
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      // String sort
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

  const countByState = (state: string, data: TFSWorkItem[]) => {
    return data.filter((item) => item.system.State === state).length;
  };

  const displayData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage]);

  function clearAllFilters(): void {
    setStateFilter("");
    setTypeFilter("");
    setAuthorizedAsFilter("");
    setTeamFilter("");
    setSprintFilter("");
    setIdSearch("");
    setTagSearch("");
    setTagFilter("");
    setDateRange({});
  }

  function getUniqueValues(filter: "state" | "type" | "AuthorizedAs" | "team"): string[] {
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

  return (
    <div className="min-h-screen w-full mx-auto flex flex-col font-sans text-sm">
      {/* ----------------------- Header / Title Section ----------------------- */}
      <header className="w-full p-6 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-wide">
          TFS Work Items Dashboard
        </h1>
        <button
          onClick={clearAllFilters}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
        >
          Clear All Filters
        </button>
      </header>

      {/* ----------------------- Main Layout: Stats + Table + Side Filters ----------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ----------- Left Panel: Filter UI + Date/Tag Filters ----------- */}
        <aside className="w-64 border-r p-4 space-y-6 overflow-y-auto hidden xl:block">
          {/* Filter Title */}
          <div className="mb-2">
            <p className="text-lg font-bold">Filters</p>
          </div>

          {/* Basic Filters */}
          <div className="space-y-2">
            <Select onValueChange={(value) => setStateFilter(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={stateFilter || "All States"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>State</SelectLabel>
                  <SelectItem value="N/A">All</SelectItem>
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
                <SelectValue placeholder={typeFilter || "All Types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="N/A">All</SelectItem>
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
                <SelectValue placeholder={AuthorizedAsFilter || "All QA"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>QA Resource</SelectLabel>
                  <SelectItem value="N/A">All</SelectItem>
                  {getUniqueValues("AuthorizedAs").map((authAs) => (
                    <SelectItem key={authAs} value={authAs}>
                      {authAs.includes("Microsoft.TeamFoundation.System")
                        ? "No Resource"
                        : authAs.split(" ").slice(0, 2).join(" ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setTeamFilter(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={teamFilter || "All Teams"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Team</SelectLabel>
                  <SelectItem value="N/A">All</SelectItem>
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
                <SelectValue placeholder={sprintFilter || "All Sprints"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sprint</SelectLabel>
                  <SelectItem value="N/A">All</SelectItem>
                  {uniqueSprints.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* ID & Tag Search */}
          <div className="space-y-2">
            <div className="flex flex-col">
              <label className="text-xs font-semibold">ID Search</label>
              <input
                type="number"
                value={idSearch}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIdSearch(e.target.value)
                }
                placeholder="Enter ID"
                className="px-2 py-1 border rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold">Tag Search</label>
              <input
                type="text"
                value={tagSearch}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTagSearch(e.target.value)
                }
                placeholder="Search tag"
                className="px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Calendar Date Range Filter */}
          <div className="space-y-2">
            <p className="font-semibold">Date Range</p>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(val: any) => {
                if (val && "from" in val) {
                  setDateRange(val);
                }
              }}
              className="border shadow rounded-md"
            />
            <div className="text-xs space-y-1">
              {dateRange.from && <p>From: {dateRange.from.toDateString()}</p>}
              {dateRange.to && <p>To: {dateRange.to.toDateString()}</p>}
            </div>
          </div>

          <Separator />

          {/* Exact Tag Filter */}
          <div className="space-y-2">
            <Select onValueChange={(value) => setTagFilter(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tagFilter || "Exact Tag Filter"} />
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

            {/* Clear Tag Filter */}
            {(tagFilter || tagSearch) && (
              <button
                onClick={() => {
                  setTagFilter("");
                  setTagSearch("");
                }}
                className="text-xs text-blue-400 underline"
              >
                Clear Tag Filter
              </button>
            )}
          </div>
        </aside>

        {/* ----------- Middle Panel: Table + Stats + Pagination ----------- */}
        <main className="flex-1 flex flex-col">
          {/* Stats Section */}
          <section className="border-b p-4 flex flex-wrap gap-4">
            <StatisticCard title="Total Items" value={data.length} />
            <StatisticCard title="Open Bugs" value={countByState("Open", data)} />
            <StatisticCard
              title="In Progress"
              value={countByState("In Progress", data)}
            />
            <StatisticCard title="Completed" value={countByState("Closed", data)} />
          </section>

          {/* Loading / Error */}
          {loading && (
            <div className="flex-1 flex justify-center items-center">
              <Loading />
            </div>
          )}
          {error && !loading && (
            <div className="flex-1 flex justify-center items-center text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Table Section */}
          {!loading && !error && (
            <section className="flex-1 overflow-x-auto p-4">
              <table className="min-w-full text-xs md:text-sm border rounded-md">
                <thead>
                  <tr className="border-b text-left uppercase">
                    {[
                      { key: 'checkbox', label: '' },
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
                        onClick={col.key ? () => handleSort(col.key as SortKey) : undefined}
                        className={cn(
                          "py-2 px-3 font-semibold cursor-pointer select-none",
                          col.key && "underline decoration-dotted"
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
                            sortConfig.direction === "ascending" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )
                          )}
                          {col.key && sortConfig?.key !== col.key && (
                            <ChevronDown
                              size={16}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
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
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3">
                          <Checkbox />
                        </td>

                        <td className="py-2 px-3">{item.id}</td>
                        <td className="py-2 px-3">
                          <a
                            href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-500 hover:underline"
                          >
                            {item.system.Title}
                          </a>
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            ticketType={mapWorkItemType(item.system.WorkItemType)}
                            className="w-20"
                          >
                            {item.system.WorkItemType}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            state={mapState(item.system.State)}
                            className="w-20 text-center"
                          >
                            {item.system.State}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          {item.system.AuthorizedAs.includes("Microsoft.TeamFoundation.System") ? (
                            <span className="text-gray-500 italic">
                              No Resource
                            </span>
                          ) : (
                            item.system.AuthorizedAs.match(/^(.*?)\s*<.*?>$/)?.[1] ||
                            item.system.AuthorizedAs.split(" ").slice(0, 2).join(" ")
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            team={teamMapping[item.costcoTravel.Team] || undefined}
                            className="w-24"
                          >
                            {item.costcoTravel.Team}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            sprint={
                              item.system.IterationPath?.includes("Sprint01")
                                ? "current"
                                : item.system.IterationPath?.includes("FY25")
                                ? "upcoming"
                                : "past"
                            }
                            className="w-28 text-center"
                          >
                            {item.system.IterationPath?.split("\\").pop()}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          {item.parsedTags.length > 0 ? (
                            item.parsedTags.map((tag, index) => (
                              <Badge key={index} className="mr-1 my-1">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary">—</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedWorkItem(item)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500">
                        No work items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {/* Pagination */}
          {!loading && !error && sortedData.length > pageSize && (
            <section className="p-4 border-t">
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm">
                <div>
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
                    {sortedData.length} entries
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = Number(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border rounded focus:outline-none"
                  />
                  <span>of {totalPages}</span>
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ----------------------- Modal Section ----------------------- */}
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
