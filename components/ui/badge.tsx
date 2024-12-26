import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
      ticketType: {
        userStory: "bg-blue-600/50 text-white",
        bug: "bg-red-600/50 text-white",
        task: "bg-green-600/50 text-white",
        feature: "bg-yellow-600/50 text-black",
        epic: "bg-purple-600/50 text-white",
      },
      state: {
        inprogress: "bg-orange-500/30 border border-yellow-400 text-white",
        accepted: "bg-teal-500/70 text-white",
        done: "bg-green-500/70 text-white",
        committed: "bg-blue-500/70 text-white",
        new: 'bg-blue-500/70 text-white ring-4 ring ring-emerald-500'
      },
      team: {
        shoppingTeam1: "bg-gray-600/50 text-white",
        shoppingTeam2: "bg-gray-500/50 text-white",
        travelTeam: "bg-indigo-600/50 text-white",
      },
      sprint: {
        current: "bg-pink-600/50 text-white",
        past: "bg-gray-400/50 text-black",
        upcoming: "bg-teal-600/50 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
      team?: any,
      ticketType?: any,
      state?: any
    }

function Badge({ className, variant, ticketType, state, team, sprint, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, ticketType, state, team, sprint }),
        className
      )}

      {...props}
    />
  );
}

export { Badge, badgeVariants };
