// hooks/useCachedFetch.ts
import { useState, useEffect, useCallback } from 'react';

interface UseCachedFetchProps<T> {
  key: string;
  fetcher: () => Promise<T>;
  cacheTime?: number; // in milliseconds
}

export function useCachedFetch<T>({
  key,
  fetcher,
  cacheTime = 5 * 60 * 1000, // default 5 minutes
}: UseCachedFetchProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = new Date().getTime();
        if (now - parsed.timestamp < cacheTime) {
          setData(parsed.data);
          setLoading(false);
          return;
        } else {
          // Cache expired
          localStorage.removeItem(key);
        }
      }

      // Fetch new data
      const freshData = await fetcher();
      setData(freshData);
      setLoading(false);
      // Store in cache
      localStorage.setItem(
        key,
        JSON.stringify({ data: freshData, timestamp: new Date().getTime() })
      );
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  }, [key, fetcher, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    localStorage.removeItem(key);
    setLoading(true);
    fetchData();
  }, [fetchData, key]);

  return { data, loading, error, refetch };
}
