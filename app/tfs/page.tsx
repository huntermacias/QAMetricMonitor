// app/tfs/page.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Modal from '../../components/Modal';
import { WorkItem } from '@/interfaces/WorkItem';
import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

type SortKey =
  | 'id'
  | 'title'
  | 'workItemType'
  | 'state'
  | 'assignedTo'
  | 'team'
  | 'rev';

interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const TFSPage: React.FC = () => {
  const [data, setData] = useState<WorkItem[]>([]);
  const [filteredData, setFilteredData] = useState<WorkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [stateFilter, setStateFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(
    null
  );

  // Chart Data
  const [bugCounts, setBugCounts] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);

  // Access the TFS base URL from environment variables
  const tfsBaseUrl =
    process.env.NEXT_PUBLIC_TFS_BASE_URL ||
    'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';

  /**
   * Fetch work items from the API on component mount.
   */
  useEffect(() => {
    const fetchTFSData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tfs');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch data: ${response.statusText}`
          );
        }
        const result: WorkItem[] = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTFSData();
  }, []);

  /**
   * Fetch bug counts per feature for the bar chart.
   */
  useEffect(() => {
    const fetchBugCounts = async () => {
      try {
        const response = await fetch('/api/bugs-per-feature');
        if (!response.ok) {
          throw new Error('Failed to fetch bug counts');
        }
        const data = await response.json();
        setBugCounts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBugCounts();
  }, []);

  /**
   * Fetch bug severity distribution for the pie chart.
   */
//   useEffect(() => {
//     const fetchSeverityData = async () => {
//       try {
//         const response = await fetch('/api/bug-severity-priority');
//         if (!response.ok) {
//           throw new Error('Failed to fetch severity data');
//         }
//         const result = await response.json();
//         const severityData = Object.entries(result.severityDistribution).map(
//           ([key, value]) => ({
//             name: key,
//             value: value as number,
//           })
//         );
//         setSeverityData(severityData);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchSeverityData();
//   }, []);

  /**
   * Apply filters whenever any filter state changes or data is updated.
   */
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, typeFilter, assignedToFilter, teamFilter, data]);

  /**
   * Apply the selected filters to the data.
   */
  const applyFilters = () => {
    let filtered = [...data];
    if (stateFilter) {
      filtered = filtered.filter((item) => item.system.State === stateFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(
        (item) => item.system.WorkItemType === typeFilter
      );
    }
    if (assignedToFilter) {
      filtered = filtered.filter(
        (item) => item.system.AssignedTo === assignedToFilter
      );
    }
    if (teamFilter) {
      filtered = filtered.filter(
        (item) => item.costcoTravel.Team === teamFilter
      );
    }
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  /**
   * Handle sorting when a table header is clicked.
   * @param key The field to sort by.
   */
  const handleSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  /**
   * Apply sorting to the filtered data based on sortConfig.
   */
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const { key, direction } = sortConfig;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.system.Title;
          bValue = b.system.Title;
          break;
        case 'workItemType':
          aValue = a.system.WorkItemType;
          bValue = b.system.WorkItemType;
          break;
        case 'state':
          aValue = a.system.State;
          bValue = b.system.State;
          break;
        case 'assignedTo':
          aValue = a.system.AssignedTo;
          bValue = b.system.AssignedTo;
          break;
        case 'team':
          aValue = a.costcoTravel.Team;
          bValue = b.costcoTravel.Team;
          break;
        case 'rev':
          aValue = a.system.Rev;
          bValue = b.system.Rev;
          break;
        default:
          break;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  /**
   * Calculate the total number of pages based on sorted data.
   */
  const totalPages = Math.ceil(sortedData.length / pageSize);

  /**
   * Get the data to display on the current page.
   */
  const displayData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  /**
   * Get unique values for a specific filter.
   * @param filter The filter to get unique values for.
   */
  const getUniqueValues = (filter: 'state' | 'type' | 'assignedTo' | 'team') => {
    switch (filter) {
      case 'state':
        return Array.from(new Set(data.map((item) => item.system.State)))
          .filter(Boolean)
          .sort();
      case 'type':
        return Array.from(new Set(data.map((item) => item.system.WorkItemType)))
          .filter(Boolean)
          .sort();
      case 'assignedTo':
        return Array.from(new Set(data.map((item) => item.system.AssignedTo)))
          .filter(Boolean)
          .sort();
      case 'team':
        return Array.from(new Set(data.map((item) => item.costcoTravel.Team)))
          .filter(Boolean)
          .sort();
      default:
        return [];
    }
  };

  // Chart configurations
  const chartConfig = {
    openBugs: {
      label: 'Open Bugs',
      color: '#FF6B6B',
    },
    closedBugs: {
      label: 'Closed Bugs',
      color: '#4ECDC4',
    },
    severityColors: ['#FF6B6B', '#FFD93D', '#6A4C93', '#4ECDC4'],
  };

  // Prepare data for Bug Count Chart
  const bugCountChartData = useMemo(() => {
    const sortedData = [...bugCounts].sort((a, b) => {
      const totalBugsA = a.openBugCount + a.closedBugCount;
      const totalBugsB = b.openBugCount + b.closedBugCount;
      return totalBugsB - totalBugsA;
    });

    return sortedData.map((feature) => ({
      featureTitle: feature.featureTitle,
      openBugCount: feature.openBugCount,
      closedBugCount: feature.closedBugCount,
    }));
  }, [bugCounts]);

  // Total bugs for the footer
  const totalBugs = useMemo(
    () =>
      bugCounts.reduce(
        (acc, curr) => acc + curr.openBugCount + curr.closedBugCount,
        0
      ),
    [bugCounts]
  );

  /**
   * Rendering the component.
   */
  return (
    <div className="min-h-screen bg-[#191919] text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-[#4ECDC4]">
          TFS Work Items Dashboard
        </h1>

        {/* Bug Counts Chart */}
        <div className="mb-12">
          <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-[#FFD93D]">
              Bug Count per Feature
            </h2>
            {bugCountChartData.length > 0 ? (
              <div className="overflow-x-auto">
                <BarChart
                  width={800}
                  height={50 * bugCountChartData.length}
                  data={bugCountChartData}
                  layout="vertical"
                  margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  barCategoryGap={0}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#444" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="featureTitle"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={300}
                    tick={{ fill: '#fff', fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.length > 40 ? `${value.slice(0, 40)}...` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', borderColor: '#333' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                  />
                  <Bar
                    dataKey="closedBugCount"
                    name="Closed Bugs"
                    stackId="a"
                    fill={chartConfig.closedBugs.color}
                    barSize={30}
                  />
                  <Bar
                    dataKey="openBugCount"
                    name="Open Bugs"
                    stackId="a"
                    fill={chartConfig.openBugs.color}
                    barSize={30}
                  />
                </BarChart>
              </div>
            ) : (
              <p>No bug count data available.</p>
            )}
            <div className="mt-4 text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-[#FFD93D]" />
                Total Bugs: {totalBugs}
              </div>
              <p className="text-gray-400">
                Scroll to view all features and their bug counts.
              </p>
            </div>
          </div>
        </div>

        {/* Bug Severity Chart */}
        <div className="mb-12">
          <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-[#FFD93D]">
              Bug Severity Distribution
            </h2>
            {severityData.length > 0 ? (
              <div className="flex justify-center">
                <PieChart width={400} height={300}>
                  <Pie
                    dataKey="value"
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartConfig.severityColors[index % chartConfig.severityColors.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', borderColor: '#333' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                  />
                </PieChart>
              </div>
            ) : (
              <p>No severity data available.</p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap space-x-4">
            {/* State Filter */}
            <select
              className="px-4 py-2 bg-[#2C2C2C] border border-[#4ECDC4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-white"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              {getUniqueValues('state').map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              className="px-4 py-2 bg-[#2C2C2C] border border-[#4ECDC4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {getUniqueValues('type').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Assigned To Filter */}
            <select
              className="px-4 py-2 bg-[#2C2C2C] border border-[#4ECDC4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-white"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
            >
              <option value="">All Assigned To</option>
              {getUniqueValues('assignedTo').map((assignedTo) => (
                <option key={assignedTo} value={assignedTo}>
                  {assignedTo}
                </option>
              ))}
            </select>

            {/* Team Filter */}
            <select
              className="px-4 py-2 bg-[#2C2C2C] border border-[#4ECDC4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-white"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="">All Teams</option>
              {getUniqueValues('team').map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center text-gray-400">
            <p>Loading work items...</p>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#1F1F1F] rounded-lg shadow-md">
                <thead>
                  <tr>
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'title', label: 'Title' },
                      { key: 'workItemType', label: 'Type' },
                      { key: 'state', label: 'State' },
                      { key: 'assignedTo', label: 'Assigned To' },
                      { key: 'team', label: 'Team' },
                      { key: 'rev', label: 'Rev' },
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="py-3 px-6 bg-[#2C2C2C] font-bold uppercase text-sm text-white cursor-pointer"
                        onClick={() => handleSort(column.key as SortKey)}
                      >
                        {column.label}{' '}
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === 'ascending'
                            ? '↑'
                            : '↓'
                          : ''}
                      </th>
                    ))}
                    <th className="py-3 px-6 bg-[#2C2C2C] font-bold uppercase text-sm text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.length > 0 ? (
                    displayData.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#2C2C2C] transition-colors"
                      >
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.id}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C]">
                          <a
                            href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4ECDC4] hover:underline"
                          >
                            {item.system.Title}
                          </a>
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.system.WorkItemType}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.system.State}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.system.AssignedTo}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.costcoTravel.Team}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          {item.system.Rev}
                        </td>
                        <td className="py-4 px-6 border-b border-[#2C2C2C] text-center">
                          <button
                            onClick={() => setSelectedWorkItem(item)}
                            className="px-3 py-1 bg-[#4ECDC4] text-[#191919] rounded-md hover:bg-[#3EB8A1] transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 px-6 border-b text-center text-gray-400"
                      >
                        No work items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {sortedData.length > pageSize && (
              <div className="flex justify-between items-center mt-6">
                <button
                  className="px-4 py-2 bg-[#2C2C2C] text-white rounded-md hover:bg-[#3A3A3A] disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-4 py-2 bg-[#2C2C2C] text-white rounded-md hover:bg-[#3A3A3A] disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal for Work Item Details */}
        {selectedWorkItem && (
          <Modal onClose={() => setSelectedWorkItem(null)}>
            <div className="bg-[#1F1F1F] p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-[#FFD93D]">
                {selectedWorkItem.system.Title}
              </h2>
              <div className="space-y-2 text-white">
                <p>
                  <strong>ID:</strong> {selectedWorkItem.id}
                </p>
                <p>
                  <strong>Type:</strong> {selectedWorkItem.system.WorkItemType}
                </p>
                <p>
                  <strong>State:</strong> {selectedWorkItem.system.State}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedWorkItem.system.Reason}
                </p>
                <p>
                  <strong>Assigned To:</strong>{' '}
                  {selectedWorkItem.system.AssignedTo}
                </p>
                <p>
                  <strong>Team:</strong> {selectedWorkItem.costcoTravel.Team}
                </p>
                <p>
                  <strong>Rev:</strong> {selectedWorkItem.system.Rev}
                </p>
                <p>
                  <strong>Effort:</strong>{' '}
                  {selectedWorkItem.microsoftVSTSCommonScheduling.Effort}
                </p>
                <p>
                  <strong>Cost of Delay:</strong>{' '}
                  {selectedWorkItem.costcoTravel.CostOfDelay}
                </p>
                <p>
                  <strong>Actual Effort:</strong>{' '}
                  {selectedWorkItem.costcoTravel.ActualEffort}
                </p>
                <p>
                  <strong>WSJF:</strong> {selectedWorkItem.costcoTravel.WSJF}
                </p>
                <p>
                  <strong>Description:</strong>
                </p>
                <div
                  className="prose max-w-none text-white"
                  dangerouslySetInnerHTML={{
                    __html: selectedWorkItem.systemDescription,
                  }}
                />
                {/* Add more fields as necessary */}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default TFSPage;
