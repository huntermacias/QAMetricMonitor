"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DateRange, DayPickerRangeProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// We'll import or define some advanced color classes or variants here
// For example, a glass or gradient
// (You can tweak these to fit your exact brand palette)
const glassBackground =
  "bg-white/30 dark:bg-[#1f242b]/30 backdrop-blur-md border border-white/10 shadow-2xl";

const advancedMonthTransitions = {
  hidden: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10 },
};

// Type redefinitions for clarity
export type CalendarProps = Omit<any, "selected" | "onSelect"> & {
  selected?: any;
  onSelect?: (range: any | undefined) => void;
};

export const Calendar: React.FC<CalendarProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  mode,
  ...props
}) => {
  return (
    <AnimatePresence mode="wait">
      {/* We'll wrap the DayPicker in a motion.div so we can animate month transitions */}
      <motion.div
        key={
          // We switch the key to re-trigger animations when props
          // that cause re-render for the month changes
          JSON.stringify(selected) + JSON.stringify(props.month)
        }
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={advancedMonthTransitions}
        className={cn("relative p-3", className)}
      >
        <DayPicker
          mode={mode} // e.g. "range" or "single"
          showOutsideDays={showOutsideDays}
          selected={selected}
          onSelect={onSelect}
          className={cn(
            "overflow-hidden rounded-lg",
            glassBackground,
            "relative isolate",
            className
          )}
          classNames={{
            months: cn(
              "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4",
              "p-4",
              "bg-transparent"
            ),
            month: "w-full space-y-4",
            caption: "relative flex justify-center pt-1 items-center",
            caption_label: "text-sm font-medium text-gray-800 dark:text-gray-100",
            nav: "space-x-1 flex items-center absolute right-0 top-0",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100 transition"
            ),
            nav_button_previous: "",
            nav_button_next: "",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-xs text-gray-500 dark:text-gray-400 w-8 font-normal text-center",
            row: "flex w-full mt-1",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              "transition hover:scale-[1.03] hover:z-10",
              "hover:shadow-md hover:shadow-primary/20"
            ),
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-8 w-8 p-0 font-normal aria-selected:opacity-100 transition-colors"
            ),
            day_range_start:
              "day-range-start ring ring-offset-1 ring-ghost ring-offset-background",
            day_range_end:
              "day-range-end ring ring-offset-1 ring-ghost ring-offset-background",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today:
              "bg-orange-500/50 text-accent-foreground ring-1 ring-accent ring-offset-2 ring-offset-background",
            day_outside:
              "day-outside text-muted-foreground disabled:opacity-60 dark:text-gray-500",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            // Keep or add more
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: ({ className, ...props }) => (
              <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
            ),
            IconRight: ({ className, ...props }) => (
              <ChevronRight className={cn("h-4 w-4", className)} {...props} />
            ),
          }}
          {...props}
        />
      </motion.div>
    </AnimatePresence>
  );
};

Calendar.displayName = "Calendar";
