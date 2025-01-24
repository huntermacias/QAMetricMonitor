import React from "react";

const ColorLegend = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center space-x-0 md:space-x-2 space-y-2 md:space-y-0">
      {/* "Less" Label */}
      <span className="text-xs text-gray-400">Less</span>

      {/* Gradient Legend */}
      <div className="flex items-center space-x-1">
        {/* Use hover transitions and slight ring to make them pop */}
        <div className="w-4 h-4 bg-[#161b22] rounded-sm hover:ring-1 hover:ring-white/20 transition"></div>
        <div className="w-4 h-4 bg-[#0e4429] rounded-sm hover:ring-1 hover:ring-white/20 transition"></div>
        <div className="w-4 h-4 bg-[#006d32] rounded-sm hover:ring-1 hover:ring-white/20 transition"></div>
        <div className="w-4 h-4 bg-[#26a641] rounded-sm hover:ring-1 hover:ring-white/20 transition"></div>
        <div className="w-4 h-4 bg-[#39d353] rounded-sm hover:ring-1 hover:ring-white/20 transition"></div>
      </div>

      {/* "More" Label */}
      <span className="text-xs text-gray-400">More</span>
    </div>
  );
};

export default ColorLegend;
