'use client';

import React, { useEffect, useState, useMemo } from 'react';
import BugCountChart from '@/components/BugCountChart';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Modal from '@/components/Modal';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
  };
  costcoTravel: {
    Team: string;
  };
  microsoftVSTSCommonScheduling: {
    Effort?: number;
  };
  systemDescription?: string;
}

// Sorting keys 
type SortKey = 'id' | 'title' | 'workItemType' | 'state' | 'AuthorizedAs' | 'team';

// Sorting config
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const TFSPage: React.FC = () => {
  const [data, setData] = useState<TFSWorkItem[]>([]);
  const [filteredData, setFilteredData] = useState<TFSWorkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters for columns
  const [stateFilter, setStateFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [AuthorizedAsFilter, setAuthorizedAsFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');

  const [tagFilter, setTagFilter] = useState<string>('');

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal
  const [selectedWorkItem, setSelectedWorkItem] = useState<TFSWorkItem | null>(null);

  // TFS URL
  const tfsBaseUrl =
    process.env.NEXT_PUBLIC_TFS_BASE_URL ||
    'https://tfs.pacific.costcotravel.com/tfs/CostcoTravel';


  useEffect(() => {
    const fetchTFSData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tfs');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch data: ${response.statusText}`);
        }
        const result: TFSWorkItem[] = await response.json();
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


  // Parse "system.tags" into arrays for each item
  // do this *once* so we can easily filter by tag
  const dataWithParsedTags = useMemo(() => {
    return data.map((item) => {
      const rawTags = item.system.tags || '';
      // Split on semicolon, trim, remove empty strings
      const parsedTags = rawTags
        .split(';')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      return {
        ...item,
        parsedTags,
      };
    });
  }, [data]);


  // get all tags across all items, then compute counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dataWithParsedTags.forEach((wi) => {
      wi.parsedTags.forEach((tag) => {
        const cleanTag = tag.replace('#', '').toLowerCase()
        counts[cleanTag] = (counts[cleanTag] || 0) + 1;
      });
    });
    return counts; // e.g. { "#CRT_Consumer_Part1": 5, "#LowerEnv": 3, "#Testability_QA": 1 }
  }, [dataWithParsedTags]);

 
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, typeFilter, AuthorizedAsFilter, teamFilter, tagFilter, dataWithParsedTags]);

  const applyFilters = () => {
    let filtered = [...dataWithParsedTags];

    // State
    if (stateFilter) {
      filtered = filtered.filter((item) => item.system.State === stateFilter);
    }
    // Type
    if (typeFilter) {
      filtered = filtered.filter((item) => item.system.WorkItemType === typeFilter);
    }
    // QA Resource
    if (AuthorizedAsFilter) {
      filtered = filtered.filter((item) => item.system.AuthorizedAs === AuthorizedAsFilter);
    }
    // Team
    if (teamFilter) {
      filtered = filtered.filter((item) => item.costcoTravel.Team === teamFilter);
    }
    // Tag (the NEW filter!)
    if (tagFilter) {
      filtered = filtered.filter((item) => item.parsedTags.includes(tagFilter));
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };


  const handleSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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
        case 'AuthorizedAs':
          aValue = a.system.AuthorizedAs;
          bValue = b.system.AuthorizedAs;
          break;
        case 'team':
          aValue = a.costcoTravel.Team;
          bValue = b.costcoTravel.Team;
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

  // used for pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const displayData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  // Distinct filter values for state, type, etc.
  const getUniqueValues = (filter: 'state' | 'type' | 'AuthorizedAs' | 'team') => {
    switch (filter) {
      case 'state':
        return Array.from(new Set(data.map((item) => item.system.State))).filter(Boolean).sort();
      case 'type':
        return Array.from(
          new Set(data.map((item) => item.system.WorkItemType))
        ).filter(Boolean).sort();
      case 'AuthorizedAs':
        return Array.from(
          new Set(data.map((item) => item.system.AuthorizedAs))
        ).filter(Boolean).sort();
      case 'team':
        return Array.from(new Set(data.map((item) => item.costcoTravel.Team))).filter(Boolean).sort();
    }
  };


  return (
    <div className="min-h-screen text-[#E0E0E0] p-4 font-sans text-xs space-y-6">
      <h1 className="text-center text-xl font-bold mb-4 tracking-wide">
        TFS Work Items Dashboard
      </h1>


      <div>
        <BugCountChart />
      </div>

      <div className="flex gap-4">
        {/* Left main content (filters + table) */}
        <div className="flex-1 space-y-4">
          {/* Filters */}
          <div className="p-2 rounded-xl shadow-md flex flex-wrap gap-2 items-center">
            {/* State */}
            <select
              className="px-2 py-1 border border-[#444] rounded focus:outline-none focus:border-blue-500"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              {getUniqueValues('state')?.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* WorkItemType */}
            <select
              className="px-2 py-1 border border-[#444] rounded focus:outline-none focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {getUniqueValues('type')?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* QA Resource */}
            <select
              className="px-2 py-1 border border-[#444] rounded focus:outline-none focus:border-blue-500"
              value={AuthorizedAsFilter}
              onChange={(e) => setAuthorizedAsFilter(e.target.value)}
            >
              <option value="">All Assigned</option>
              {getUniqueValues('AuthorizedAs')?.map((AuthorizedAs) => (
                <option key={AuthorizedAs} value={AuthorizedAs}>
                  {AuthorizedAs.split(' ').slice(0, 2).join(' ')}
                </option>
              ))}
            </select>

            {/* Team */}
            <select
              className="px-2 py-1 border border-[#444] rounded focus:outline-none focus:border-blue-500"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="">All Teams</option>
              {getUniqueValues('team')?.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Loading/Error states */}
          {loading && (
            <div className="text-center text-gray-400">
              <Skeleton height={20} count={1} />
              <p className="mt-2">Loading work items...</p>
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm">
              <p>Error: {error}</p>
            </div>
          )}

          {/* Main Table */}
          {!loading && !error && (
            <div className="border rounded-xl shadow-md p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-[#E0E0E0]">
                  <thead>
                    <tr className="border-b uppercase tracking-wider">
                      {[
                        { key: 'id', label: 'ID' },
                        { key: 'title', label: 'Title' },
                        { key: 'workItemType', label: 'Type' },
                        { key: 'state', label: 'State' },
                        { key: 'AuthorizedAs', label: 'QA Resource' },
                        { key: 'team', label: 'Team' },
                        { key: 'tags', label: 'Tags' },
                        { key: '', label: 'Actions' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={
                            col.key ? () => handleSort(col.key as SortKey) : undefined
                          }
                          className={`py-2 px-4 text-left font-semibold cursor-pointer hover:bg-[#333] ${col.key ? 'underline decoration-dotted' : ''
                            }`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {col.label}{' '}
                          {col.key && sortConfig?.key === col.key
                            ? sortConfig.direction === 'ascending'
                              ? '↑'
                              : '↓'
                            : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.length > 0 ? (
                      displayData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#333] transition-colors"
                        >
                          {/* ID */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.id}
                          </td>

                          {/* Title (clickable link to TFS) */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            <a
                              href={`${tfsBaseUrl}/Work%20Items/_workitems/edit/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {item.system.Title}
                            </a>
                          </td>

                          {/* Type */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.system.WorkItemType}
                          </td>

                          {/* State */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.system.State}
                          </td>

                          {/* QA Resource */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.system.AuthorizedAs.split(' ').slice(0, 2).join(' ')}
                          </td>

                          {/* Team */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.costcoTravel.Team}
                          </td>

                          {/* Tags */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            {item.system.tags ? (
                              item.system.tags.split(';').map((tag, index) => (
                                <Badge key={index} className="mr-1 my-1">{tag.trim()}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">No tags</span>
                            )}
                          </td>


                          {/* Actions */}
                          <td className="py-2 px-4 border-b border-[#444] text-left">
                            <button
                              onClick={() => setSelectedWorkItem(item)}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 px-6 border-b border-[#444] text-center text-gray-500"
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
                <div className="flex justify-between items-center mt-2 text-gray-300 text-[0.7rem]">
                  <button
                    className="px-2 py-1 border border-[#444] rounded hover:bg-[#333] disabled:opacity-50"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span className="mx-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-2 py-1 border border-[#444] rounded hover:bg-[#333] disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal */}
          {selectedWorkItem && (
            <Modal onClose={() => setSelectedWorkItem(null)}>
              <div className="space-y-1 text-xs text-[#E0E0E0]">
                <h2 className="text-sm font-bold mb-2">
                  {selectedWorkItem.system.Title}
                </h2>
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
                  <strong>QA Resource:</strong> {selectedWorkItem.system.AuthorizedAs}
                </p>
                <p>
                  <strong>Team:</strong> {selectedWorkItem.costcoTravel.Team}
                </p>
                <p>
                  <strong>Effort:</strong>{' '}
                  {selectedWorkItem.microsoftVSTSCommonScheduling.Effort}
                </p>
                <p>
                  <strong>Description:</strong>
                </p>
                <div
                  className="prose prose-invert max-w-none text-xs leading-tight"
                  dangerouslySetInnerHTML={{
                    __html: selectedWorkItem.systemDescription || '',
                  }}
                />
              </div>
            </Modal>
          )}
        </div>

        {/* Right side: Tag metrics panel */}
        <div className="w-[220px] border rounded-md p-2 space-y-2 h-fit">
          <h2 className="font-bold text-sm text-gray-200">Tag Metrics</h2>
          {/* Dropdown for Tags */}
          <Select onValueChange={(value) => setTagFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={tagFilter || "Select a tag"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tags</SelectLabel>
                {Object.entries(tagCounts)
                  .sort((a, b) => b[1] - a[1]) // Sort tags by count (desc)
                  .map(([tag, count]) => (
                    <SelectItem key={tag} value={tag}>
                      {tag} - {count}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* A small "Clear" button to remove tag filter */}
          {tagFilter && (
            <button
              onClick={() => setTagFilter('')}
              className="mt-1 text-xs text-blue-400 underline"
            >
              Clear Tag Filter
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TFSPage;
