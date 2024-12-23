import React from 'react';

const ColorLegend = () => {
  return (
    <div className="flex justify-center items-center space-x-2">
      {/* "Less" Label */}
      <span className="text-xs text-gray-500">Less</span>

      {/* Gradient Legend */}
      <div className="flex items-center space-x-1">
        <div className="w-4 h-4 bg-[#161b22] rounded-sm"></div> {/* 0 contributions */}
        <div className="w-4 h-4 bg-[#0e4429] rounded-sm"></div> {/* 1-9 contributions */}
        <div className="w-4 h-4 bg-[#006d32] rounded-sm"></div> {/* 10-19 contributions */}
        <div className="w-4 h-4 bg-[#26a641] rounded-sm"></div> {/* 20-29 contributions */}
        <div className="w-4 h-4 bg-[#39d353] rounded-sm"></div> {/* 30+ contributions */}
      </div>

      {/* "More" Label */}
      <span className="text-xs text-gray-500">More</span>
    </div>
  );
};

export default ColorLegend;
