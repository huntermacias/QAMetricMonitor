import { FC } from "react";
import { format, parseISO } from "date-fns";

type TooltipProps = {
  date: string;
  count: number;
};

export const Tooltip: FC<TooltipProps> = ({ date, count }) => {
  // Additional arrow styling
  return (
    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 z-50">
      {/* Arrow */}
      <div className="mx-auto mb-[-4px] w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800" />
      
      {/* Tooltip Body */}
      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
        <div>
          <strong>{count} contribution{count !== 1 ? "s" : ""}</strong>
        </div>
        <div>{format(parseISO(date), "EEE, MMM d, yyyy")}</div>
      </div>
    </div>
  );
};
