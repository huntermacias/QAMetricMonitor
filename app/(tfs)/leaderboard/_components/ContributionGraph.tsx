import { FC, useState } from 'react';
import { format, parseISO, startOfWeek } from 'date-fns';

type ContributionGridProps = {
  data: Record<string, number>; // { '2024-01-01': 5, '2024-01-02': 0, ... }
};

export const ContributionGrid: FC<ContributionGridProps> = ({ data }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#161b22]';
    if (count < 2) return 'bg-[#0e4429]';
    if (count < 3) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  // Convert data keys to Date objects and sort them
  const sortedDates = Object.keys(data)
    .map((date) => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime());

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  sortedDates.forEach((date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday as start
    const existingWeek = weeks.find(
      (week) => week[0].getTime() === weekStart.getTime()
    );

    if (!existingWeek) {
      currentWeek = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        currentWeek.push(day);
      }
      weeks.push(currentWeek);
    }
  });

  return (
    <div className="relative">
      <div className="flex space-x-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col space-y-1">
            {week.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = data[dateStr] || 0;
              return (
                <div
                  key={dateStr}
                  className={`w-4 h-4 rounded-sm ${getCellColor(
                    count
                  )} relative cursor-pointer`}
                  onMouseEnter={() => setActiveTooltip(dateStr)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  tabIndex={0}
                  aria-label={`${count} contributions on ${format(
                    day,
                    'EEEE, MMMM d, yyyy'
                  )}`}
                >
                  {activeTooltip === dateStr && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap">
                      <strong>
                        {count} contribution{count !== 1 ? 's' : ''}
                      </strong>
                      <div>{format(day, 'EEEE, MMMM d, yyyy')}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
