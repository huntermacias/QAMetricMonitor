'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type WorkItem = {
  id: number;
  title: string;
  state: string;
  type: string;
};

export default function CRTBugsDashboard() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('All');

  // Fetch data from the API
  useEffect(() => {
    async function fetchWorkItems() {
      try {
        const response = await fetch('http://localhost:3001/api/tfs/crtbugs');
        const data = await response.json();
        setWorkItems(data.workItems);
        setFilteredItems(data.workItems);
      } catch (error) {
        console.error('Error fetching work items:', error);
      }
    }

    fetchWorkItems();
  }, []);

  // Filter logic
  useEffect(() => {
    const filtered = workItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesState = filterState === 'All' || item.state === filterState;
      return matchesSearch && matchesState;
    });
    setFilteredItems(filtered);
  }, [search, filterState, workItems]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">TFS CRT Bugs Dashboard</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <Input
          placeholder="Search bugs by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bug Details</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.state}</TableCell>
                    <TableCell>{item.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No bugs match your criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
