import { useState, useMemo } from "react";

export default function usePagination(data: any[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => Math.ceil(data.length / pageSize), [data, pageSize]);

  const pageData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  return {
    currentPage,
    totalPages,
    pageData,
    setPage: setCurrentPage,
  };
}
