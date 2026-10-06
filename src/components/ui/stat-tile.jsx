import * as React from "react";
import { cn } from "../../lib/utils";

const toneClasses = {
  default: "text-foreground",
  risk: "text-rose-600 dark:text-rose-400"
};

/**
 * Compact KPI tile shared by every dashboard view.
 *
 * Color policy: values are neutral by default; `tone="risk"` is reserved
 * for alert / critical counts so color stays a signal, never decoration.
 */
const StatTile = ({
  label,
  value,
  sub,
  tone = "default",
  valueClassName,
  className
}) => (
  <div className={cn("bg-muted/50 border border-border rounded-lg p-3", className)}>
    <span className="text-[11px] font-medium text-muted-foreground block truncate">
      {label}
    </span>
    <span
      className={cn(
        "text-base font-semibold tabular-nums block mt-0.5",
        toneClasses[tone] || toneClasses.default,
        valueClassName
      )}
    >
      {value}
    </span>
    {sub && (
      <span className="text-[11px] text-muted-foreground block mt-0.5">{sub}</span>
    )}
  </div>
);

export { StatTile };
export default StatTile;
