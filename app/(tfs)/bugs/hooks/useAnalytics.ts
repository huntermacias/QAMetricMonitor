import { useMemo } from "react";

export default function useAnalytics(data: any[]) {
  const analyticsData = useMemo(() => {
    const dist: Record<string, number> = {};
    data.forEach((item) => {
      const type = item.system.WorkItemType;
      dist[type] = (dist[type] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [data]);

  return { analyticsData };
}
