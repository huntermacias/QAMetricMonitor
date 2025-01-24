import { useState, useCallback } from "react";

export default function useFilters() {
  const [filters, setFilters] = useState({
    state: "N/A",
    type: "N/A",
    team: "N/A",
    sprint: "N/A",
    idSearch: "",
    tagSearch: "",
    tagFilter: "",
  });

  const applyFilters = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      state: "N/A",
      type: "N/A",
      team: "N/A",
      sprint: "N/A",
      idSearch: "",
      tagSearch: "",
      tagFilter: "",
    });
  }, []);

  return { filters, applyFilters, clearFilters };
}
