import { FC, useState } from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { motion } from "framer-motion";

import { Tooltip } from "./Tooltip";

type ContributionGridProps = {
  data: Record<string, number>; // { '2024-01-01': 5, '2024-01-02': 0, ... }
};

export const ContributionGrid: FC<ContributionGridProps> = ({ data }) => {
  const [activeDate, setActiveDate] = useState<string | null>(null);

  // Not a lot of commits happen a day so the counts are usually small
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-[#161b22]";
    if (count < 3) return "bg-[#0e4429]";
    if (count < 5) return "bg-[#006d32]";
    if (count < 10) return "bg-[#26a641]";
    return "bg-[#39d353]";
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

  // Framer Motion variants for a staggered grid load
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const cellVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12,
      },
    },
  };

  return (
    <motion.div
      className="relative"
      variants={gridVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex space-x-1">
        {weeks.map((week, weekIndex) => (
          <motion.div
            key={weekIndex}
            className="flex flex-col space-y-1"
            variants={gridVariants}
          >
            {week.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const count = data[dateStr] || 0;

              return (
                <motion.div
                  key={dateStr}
                  className={`w-4 h-4 rounded-sm ring-1 ring-white/10 ${getCellColor(
                    count
                  )} relative cursor-pointer hover:scale-[1.2] transition-transform`}
                  variants={cellVariants}
                  onMouseEnter={() => setActiveDate(dateStr)}
                  onMouseLeave={() => setActiveDate(null)}
                  onFocus={() => setActiveDate(dateStr)}
                  onBlur={() => setActiveDate(null)}
                  tabIndex={0}
                  aria-label={`${count} contributions on ${format(
                    day,
                    "EEEE, MMMM d, yyyy"
                  )}`}
                >
                  {/* If this cell is active/hovered, show the tooltip */}
                  {activeDate === dateStr && (
                    <Tooltip date={dateStr} count={count} />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
