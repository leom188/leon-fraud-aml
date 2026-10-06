import React from 'react';

/**
 * Neutral legend card shared by every doughnut chart.
 * The series color is carried by a small dot so the card itself stays quiet.
 */
export const LegendCard = ({ color, label, pct, value, subLeft, subRight }) => (
  <div className="bg-muted/50 border border-border rounded-lg p-2.5 space-y-1">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[11px] font-semibold text-foreground tabular-nums shrink-0">
        {pct}
      </span>
    </div>
    <div className="text-xs font-semibold text-foreground tabular-nums">
      {value}
    </div>
    <div className="text-[10px] text-muted-foreground flex justify-between gap-2">
      <span className="tabular-nums truncate">{subLeft}</span>
      <span className="tabular-nums truncate">{subRight}</span>
    </div>
  </div>
);

export default LegendCard;
