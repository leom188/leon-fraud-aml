import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js';
import { DollarSign, Hash } from 'lucide-react';
import { CHART_COLORS, TOOLTIP, toggleGroup, toggleButton } from './chartTheme';
import LegendCard from './LegendCard';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export const DirectionalFlowChart = ({
  incomingVolume = 0,
  outgoingVolume = 0,
  incomingCount = 0,
  outgoingCount = 0,
  uniqueSenders = 0,
  uniquePayees = 0
}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [metricMode, setMetricMode] = useState('volume'); // 'volume' | 'count'

  const totalVolume = incomingVolume + outgoingVolume;
  const totalCount = incomingCount + outgoingCount;

  const incomingPct = metricMode === 'volume'
    ? (totalVolume > 0 ? Math.round((incomingVolume / totalVolume) * 100) : 0)
    : (totalCount > 0 ? Math.round((incomingCount / totalCount) * 100) : 0);

  const outgoingPct = 100 - incomingPct;

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const isVol = metricMode === 'volume';
    const dataValues = isVol
      ? [incomingVolume, outgoingVolume]
      : [incomingCount, outgoingCount];

    const ctx = canvasRef.current.getContext('2d');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Incoming (From Senders)', 'Outgoing (To Payees)'],
        datasets: [
          {
            data: dataValues,
            backgroundColor: [
              CHART_COLORS.primary,    // Incoming
              CHART_COLORS.secondary   // Outgoing
            ],
            hoverBackgroundColor: [
              CHART_COLORS.primaryDark,
              CHART_COLORS.secondaryDark
            ],
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
                if (isVol) {
                  return ` Volume: $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return ` Transactions: ${val.toLocaleString()}`;
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
  }, [incomingVolume, outgoingVolume, incomingCount, outgoingCount, metricMode]);

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Metric Mode Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className={toggleGroup}>
          <button
            type="button"
            onClick={() => setMetricMode('volume')}
            className={toggleButton(metricMode === 'volume')}
          >
            <DollarSign size={13} />
            <span>Volume ($)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={toggleButton(metricMode === 'count')}
          >
            <Hash size={13} />
            <span>Tx count</span>
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground tabular-nums">
          Ratio: <b className="font-semibold text-primary">{incomingPct}%</b> / <b className="font-semibold text-sky-600 dark:text-sky-400">{outgoingPct}%</b>
        </span>
      </div>

      {/* Doughnut Chart Canvas with Center Stat */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {metricMode === 'volume' ? 'Total volume' : 'Total txns'}
          </span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {metricMode === 'volume'
              ? `$${(totalVolume >= 1000000 ? (totalVolume / 1000000).toFixed(1) + 'M' : totalVolume >= 1000 ? (totalVolume / 1000).toFixed(1) + 'k' : totalVolume.toFixed(0))}`
              : totalCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Breakdown Legend Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <LegendCard
          color={CHART_COLORS.primary}
          label="Incoming"
          pct={`${incomingPct}%`}
          value={`$${incomingVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subLeft={`${incomingCount.toLocaleString()} txns`}
          subRight={`${uniqueSenders.toLocaleString()} senders`}
        />
        <LegendCard
          color={CHART_COLORS.secondary}
          label="Outgoing"
          pct={`${outgoingPct}%`}
          value={`$${outgoingVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subLeft={`${outgoingCount.toLocaleString()} txns`}
          subRight={`${uniquePayees.toLocaleString()} payees`}
        />
      </div>
    </div>
  );
};

export default DirectionalFlowChart;
