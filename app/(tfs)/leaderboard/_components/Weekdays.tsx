import { FC } from "react";

export const Weekdays: FC = () => {
  // Typically for GitHub-like heatmaps, we show Sun -> Sat on the vertical axis
  // but you said you only need Mon, Wed, Fri. Feel free to adjust as needed.
  const days = ["Mon", "Wed", "Fri"];

  return (
    <div className="flex flex-col space-y-5 mr-3 mt-5">
      {days.map((day, index) => (
        <div key={index} className="text-xs text-gray-400 h-4">
          {day}
        </div>
      ))}
    </div>
  );
};
