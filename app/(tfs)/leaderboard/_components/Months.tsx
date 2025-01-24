import { FC } from "react";
import { parseISO, format, startOfWeek } from "date-fns";

type MonthsProps = {
  data: Record<string, number>;
};

export const Months: FC<MonthsProps> = ({ data }) => {
  const sortedDates = Object.keys(data)
    .map((date) => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime());

  // Group dates by week (Sunday -> Saturday)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  sortedDates.forEach((date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
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

  // Identify the first week of each month
  const monthLabels: { month: string; weekIndex: number }[] = [];
  weeks.forEach((week, index) => {
    const firstDay = week[0];
    const month = format(firstDay, "MMM");
    if (
      monthLabels.length === 0 ||
      monthLabels[monthLabels.length - 1].month !== month
    ) {
      monthLabels.push({ month, weekIndex: index });
    }
  });

  // This controls how much horizontal space each week takes (adjust to your liking)
  const WEEK_WIDTH = 15; 

  return (
    <div className="absolute -top-6  flex ">
      {monthLabels.map((label, index) => (
        <div
          key={index}
          className="text-xs text-gray-400"
          style={{
            marginLeft:
              index === 0
                ? 0
                : `${(label.weekIndex - monthLabels[index - 1].weekIndex) * WEEK_WIDTH}px`,
          }}
        >
          {label.month}
        </div>
      ))}
    </div>
  );
};
