import { FC } from "react";

interface StatisticCardProps {
  title: string;
  value?: number; // Make value optional
  children?: React.ReactNode; // Add children prop
}

const StatisticCard: FC<StatisticCardProps> = ({ title, value, children }) => {
  return (
    <div className="relative w-full max-w-[250px]">
      {/* Animated Border Wrapper */}
      <div className="card-wrapper h-[200px] w-[200px]">
        {/* Card Content */}
        <div className="card-content flex items-center justify-center text-xs h-[99%] w-[99%] rounded-xl">
          <div className="flex flex-col text-center text-base font-medium">
            <p className="">{title}</p>
            {value !== undefined ? (
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            ) : (
              <div className="mt-2">{children}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;
