import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js';
import { CHART_COLORS, TOOLTIP, toggleGroup, toggleButton } from './chartTheme';
import LegendCard from './LegendCard';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

/**
 * Pass-Through / Funnel Ratio Chart
 * Measures the velocity of funds entering vs exiting the system or customer accounts.
 * High Pass-Through (Outflow / Inflow close to 100%) indicates money mule or transit account behavior.
 */
export const PassThroughFunnelChart = ({
  allTransactions = [],
  incomingVolume = 0,
  outgoingVolume = 0,
  incomingCount = 0,
  outgoingCount = 0
}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [viewMode, setViewMode] = useState('portfolio'); // 'portfolio' | 'entities'

  // Forensic calculation of funnel dynamics and transit accounts
  const funnelData = useMemo(() => {
    // 1. Portfolio-level funnel ratio
    const globalFunnelRatio = incomingVolume > 0
      ? Math.round((outgoingVolume / incomingVolume) * 1000) / 10
      : (outgoingVolume > 0 ? 100 : 0);

    const retainedVolume = Math.max(0, incomingVolume - outgoingVolume);
    const retentionRate = incomingVolume > 0
      ? Math.round((retainedVolume / incomingVolume) * 1000) / 10
      : 0;

    // 2. Account-level pass-through distribution
    const accountMap = new Map();

    allTransactions.forEach(tx => {
      const key = tx.customer_account || tx.customer_id || tx.client_name || 'unknown';
      if (!accountMap.has(key)) {
        accountMap.set(key, { inVol: 0, outVol: 0, inTx: 0, outTx: 0 });
      }
      const item = accountMap.get(key);
      const amt = Number(tx.amount) || 0;
      if (tx.transaction_direction === 'Incoming') {
        item.inVol += amt;
        item.inTx += 1;
      } else if (tx.transaction_direction === 'Outgoing') {
        item.outVol += amt;
        item.outTx += 1;
      }
    });

    let highPassThroughCount = 0; // >= 80% out/in
    let highPassThroughVol = 0;
    let balancedCount = 0;       // 20% - 79% out/in
    let balancedVol = 0;
    let sinkCount = 0;           // < 20% out/in (Accumulators)
    let sinkVol = 0;
    let pureOutCount = 0;        // In == 0, Out > 0

    accountMap.forEach(acc => {
      const totalAccVol = acc.inVol + acc.outVol;
      if (acc.inVol > 0) {
        const ratio = (acc.outVol / acc.inVol) * 100;
        if (ratio >= 80) {
          highPassThroughCount += 1;
          highPassThroughVol += totalAccVol;
        } else if (ratio >= 20) {
          balancedCount += 1;
          balancedVol += totalAccVol;
        } else {
          sinkCount += 1;
          sinkVol += totalAccVol;
        }
      } else if (acc.outVol > 0) {
        pureOutCount += 1;
      }
    });

    return {
      globalFunnelRatio,
      retainedVolume,
      retentionRate,
      highPassThroughCount,
      highPassThroughVol,
      balancedCount,
      balancedVol,
      sinkCount,
      sinkVol,
      pureOutCount,
      totalAccounts: accountMap.size
    };
  }, [allTransactions, incomingVolume, outgoingVolume]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const isPortfolio = viewMode === 'portfolio';

    const labels = isPortfolio
      ? ['Disbursed Outflow', 'Retained Inflow']
      : ['High Pass-Through (≥80%)', 'Balanced Flow (20-79%)', 'Capital Sinks (<20%)'];

    const dataValues = isPortfolio
      ? [outgoingVolume, funnelData.retainedVolume]
      : [funnelData.highPassThroughCount, funnelData.balancedCount, funnelData.sinkCount];

    // Portfolio mode mirrors the Directional Flow palette (sky = out, blue = retained).
    // Entities mode uses risk signal colors (red = high transit, amber = balanced).
    const backgroundColors = isPortfolio
      ? [CHART_COLORS.secondary, CHART_COLORS.primary]
      : [CHART_COLORS.danger, CHART_COLORS.warning, CHART_COLORS.primary];

    const hoverColors = isPortfolio
      ? [CHART_COLORS.secondaryDark, CHART_COLORS.primaryDark]
      : [CHART_COLORS.dangerDark, CHART_COLORS.warningDark, CHART_COLORS.primaryDark];

    const ctx = canvasRef.current.getContext('2d');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: dataValues,
            backgroundColor: backgroundColors,
            hoverBackgroundColor: hoverColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            ...TOOLTIP,
            callbacks: {
              label: function (context) {
                const val = context.raw || 0;
                if (isPortfolio) {
                  return ` Volume: $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return ` Accounts: ${val.toLocaleString()}`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 600
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [funnelData, viewMode, outgoingVolume]);

  const ratioIsHigh = funnelData.globalFunnelRatio >= 80;

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Mode Toggle Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className={toggleGroup}>
          <button
            type="button"
            onClick={() => setViewMode('portfolio')}
            className={toggleButton(viewMode === 'portfolio')}
          >
            Portfolio funnel
          </button>
          <button
            type="button"
            onClick={() => setViewMode('entities')}
            className={toggleButton(viewMode === 'entities')}
          >
            Transit entities
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground tabular-nums">
          Funnel:{' '}
          <b className={`font-semibold ${ratioIsHigh ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {funnelData.globalFunnelRatio}%
          </b>
        </span>
      </div>

      {/* Doughnut Canvas with Center Stat */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {viewMode === 'portfolio' ? 'Funnel ratio' : 'High transit'}
          </span>
          <span className={`text-lg font-semibold tabular-nums ${ratioIsHigh ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            {viewMode === 'portfolio'
              ? `${funnelData.globalFunnelRatio}%`
              : `${funnelData.highPassThroughCount} accounts`}
          </span>
        </div>
      </div>

      {/* Breakdown Legend Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] px-1">
          <span className="text-muted-foreground">Total inflow intake:</span>
          <span className="font-semibold text-foreground tabular-nums">
            ${incomingVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <LegendCard
            color={CHART_COLORS.secondary}
            label="Disbursed out"
            pct={`${funnelData.globalFunnelRatio}%`}
            value={`$${outgoingVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            subLeft={`${outgoingCount.toLocaleString()} txns`}
            subRight="Exited"
          />
          <LegendCard
            color={CHART_COLORS.primary}
            label="Retained in"
            pct={`${funnelData.retentionRate}%`}
            value={`$${funnelData.retainedVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            subLeft="Absorption"
            subRight="In-system"
          />
        </div>
      </div>
    </div>
  );
};

export default PassThroughFunnelChart;
