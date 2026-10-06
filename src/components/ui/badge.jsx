import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-accent-foreground",
        secondary:
          "border-transparent bg-muted text-muted-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        critical:
          "border-rose-300 dark:border-rose-900/80 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold",
        elevated:
          "border-amber-300 dark:border-amber-900/80 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-bold",
        compliant:
          "border-emerald-300 dark:border-emerald-900/80 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold",
        cyan:
          "border-cyan-300 dark:border-cyan-800/80 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-medium",
        purple:
          "border-purple-300 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
