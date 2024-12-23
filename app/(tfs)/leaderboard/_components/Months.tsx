import { FC } from 'react';
import { parseISO, format, startOfWeek } from 'date-fns';

type MonthsProps = {
  data: Record<string, number>;
};

export const Months: FC<MonthsProps> = ({ data }) => {
  const sortedDates = Object.keys(data)
    .map((date) => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime());

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  sortedDates.forEach((date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
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
    const month = format(firstDay, 'MMM');
    if (
      monthLabels.length === 0 ||
      monthLabels[monthLabels.length - 1].month !== month
    ) {
      monthLabels.push({ month, weekIndex: index });
    }
  });

  // Calculate dynamic spacing for month labels
  const weekWidth = 15; // Width of each week column (adjust as needed)
  return (
    <div className="absolute -top-8 left-0 flex mt-4">
      {monthLabels.map((label, index) => (
        <div
          key={index}
          className="text-xs text-gray-500"
          style={{
            marginLeft: index === 0 ? 0 : `${(label.weekIndex - monthLabels[index - 1].weekIndex) * weekWidth}px`,
          }}
        >
          {label.month}
        </div>
      ))}
    </div>
  );
};
