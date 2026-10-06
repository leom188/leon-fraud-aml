import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js';
import { DollarSign, Users } from 'lucide-react';
import { CHART_COLORS, TOOLTIP, toggleGroup, toggleButton } from './chartTheme';
import LegendCard from './LegendCard';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

/**
 * Counterparty Velocity Chart
 * Analyzes First-Time (Single Interaction, 1x) vs Repeat (Recurring, >=2x) counterparties
 * using Chart.js doughnut visualization.
 */
export const CounterpartyVelocityChart = ({ allTransactions = [] }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [metricMode, setMetricMode] = useState('count'); // 'count' | 'volume'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'senders' | 'payees'

  // Aggregate counterparty frequency & volume
  const velocityData = useMemo(() => {
    const counterpartyMap = new Map();

    allTransactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;

      // Sender (Incoming originator)
      if (roleFilter === 'all' || roleFilter === 'senders') {
        const sender = (tx.sender_email || tx.sender_name || '').trim().toLowerCase();
        if (sender && sender !== 'n/a' && sender !== 'null') {
          const key = `sender:${sender}`;
          if (!counterpartyMap.has(key)) {
            counterpartyMap.set(key, { identifier: sender, role: 'sender', count: 0, volume: 0 });
          }
          const item = counterpartyMap.get(key);
          item.count += 1;
          item.volume += amt;
        }
      }

      // Payee (Outgoing beneficiary)
      if (roleFilter === 'all' || roleFilter === 'payees') {
        const payee = (tx.recipient_email || tx.recipient_name || '').trim().toLowerCase();
        if (payee && payee !== 'n/a' && payee !== 'null') {
          const key = `payee:${payee}`;
          if (!counterpartyMap.has(key)) {
            counterpartyMap.set(key, { identifier: payee, role: 'payee', count: 0, volume: 0 });
          }
          const item = counterpartyMap.get(key);
          item.count += 1;
          item.volume += amt;
        }
      }
    });

    let firstTimeCount = 0;
    let firstTimeVol = 0;
    let repeatCount = 0;
    let repeatVol = 0;
    let repeatTxns = 0;

    counterpartyMap.forEach(item => {
      if (item.count === 1) {
        firstTimeCount += 1;
        firstTimeVol += item.volume;
      } else {
        repeatCount += 1;
        repeatVol += item.volume;
        repeatTxns += item.count;
      }
    });

    const totalEntities = firstTimeCount + repeatCount;
    const totalVolume = firstTimeVol + repeatVol;

    const firstTimePct = metricMode === 'count'
      ? (totalEntities > 0 ? Math.round((firstTimeCount / totalEntities) * 100) : 0)
      : (totalVolume > 0 ? Math.round((firstTimeVol / totalVolume) * 100) : 0);

    const repeatPct = totalEntities > 0 ? 100 - firstTimePct : 0;
    const avgTxPerRepeat = repeatCount > 0 ? (repeatTxns / repeatCount).toFixed(1) : '0';

    return {
      firstTimeCount,
      firstTimeVol,
      repeatCount,
      repeatVol,
      repeatTxns,
      totalEntities,
      totalVolume,
      firstTimePct,
      repeatPct,
      avgTxPerRepeat
    };
  }, [allTransactions, roleFilter, metricMode]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const isCount = metricMode === 'count';
    const dataValues = isCount
      ? [velocityData.firstTimeCount, velocityData.repeatCount]
      : [velocityData.firstTimeVol, velocityData.repeatVol];

    const ctx = canvasRef.current.getContext('2d');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['First-Time (1x Interaction)', 'Repeat (≥2x Transactions)'],
        datasets: [
          {
            data: dataValues,
            backgroundColor: [
              CHART_COLORS.secondary, // First-time (one-off)
              CHART_COLORS.primary    // Repeat (recurring)
            ],
            hoverBackgroundColor: [
              CHART_COLORS.secondaryDark,
              CHART_COLORS.primaryDark
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
        cutout: '74%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            ...TOOLTIP,
            callbacks: {
              label: function (context) {
                const val = context.raw || 0;
                if (!isCount) {
                  return ` Volume: $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
                return ` Counterparties: ${val.toLocaleString()}`;
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
  }, [velocityData, metricMode]);

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Controls: Role Filter & Metric Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Role Toggle: All / Senders / Payees */}
        <div className={toggleGroup}>
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={toggleButton(roleFilter === 'all')}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('senders')}
            className={toggleButton(roleFilter === 'senders')}
          >
            Senders
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('payees')}
            className={toggleButton(roleFilter === 'payees')}
          >
            Payees
          </button>
        </div>

        {/* Metric Toggle: Count vs Volume */}
        <div className={toggleGroup}>
          <button
            type="button"
            onClick={() => setMetricMode('count')}
            className={toggleButton(metricMode === 'count')}
          >
            <Users size={12} />
            <span>Entities</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('volume')}
            className={toggleButton(metricMode === 'volume')}
          >
            <DollarSign size={12} />
            <span>Volume ($)</span>
          </button>
        </div>
      </div>

      {/* Doughnut Chart Canvas with Center Stat */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-2">
            {metricMode === 'count' ? 'Total entities' : 'Total volume'}
          </span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {metricMode === 'count'
              ? velocityData.totalEntities.toLocaleString()
              : `$${(velocityData.totalVolume >= 1000000 ? (velocityData.totalVolume / 1000000).toFixed(1) + 'M' : velocityData.totalVolume >= 1000 ? (velocityData.totalVolume / 1000).toFixed(1) + 'k' : velocityData.totalVolume.toFixed(0))}`}
          </span>
        </div>
      </div>

      {/* Breakdown Legend Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <LegendCard
          color={CHART_COLORS.secondary}
          label="First-time (1x)"
          pct={`${velocityData.firstTimePct}%`}
          value={`${velocityData.firstTimeCount.toLocaleString()} entities`}
          subLeft={`$${velocityData.firstTimeVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subRight="Single-use"
        />
        <LegendCard
          color={CHART_COLORS.primary}
          label="Repeat (≥2x)"
          pct={`${velocityData.repeatPct}%`}
          value={`${velocityData.repeatCount.toLocaleString()} entities`}
          subLeft={`$${velocityData.repeatVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subRight={`~${velocityData.avgTxPerRepeat} tx/ea`}
        />
      </div>
    </div>
  );
};

export default CounterpartyVelocityChart;
