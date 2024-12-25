// components/StatisticCard.tsx

import { FC } from "react";

interface StatisticCardProps {
  title: string;
  value?: number; // Make value optional
  children?: React.ReactNode; // Add children prop
}

const StatisticCard: FC<StatisticCardProps> = ({ title, value, children }) => {
  return (
    <div className="flex-1 min-w-[150px] p-4 border mb-2 rounded-lg shadow">
      <p className="text-sm font-medium">{title}</p>
      {value !== undefined ? (
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      ) : (
        children
      )}
    </div>
  );
};

export default StatisticCard;